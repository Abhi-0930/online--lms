import { toast } from "sonner";
import { API_BASE_URL, getAuthHeaders } from "./apiConfig";

export interface RazorpayCheckoutOptions {
  courseId: string;
  courseTitle: string;
  price?: string | number;
  user?: {
    id?: string;
    email?: string;
    fullName?: string;
    name?: string;
  } | null;
  onOpen?: () => void;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

let razorpayScriptPromise: Promise<boolean> | null = null;

interface PreloadedCheckoutState {
  orderData: any;
  rzpInstance: any;
  promise: Promise<any>;
  currentCallbacks: {
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    onCancel?: () => void;
    onOpen?: () => void;
  };
}

// Map of cacheKey -> PreloadedCheckoutState
const preloadedCheckouts = new Map<string, PreloadedCheckoutState>();

/**
 * Dynamically load Razorpay standard checkout script (cached singleton)
 */
export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

/**
 * Helper to build Razorpay options
 */
function createRazorpayOptions({
  orderData,
  courseId,
  courseTitle,
  user,
  callbacksRef,
  cacheKey,
}: {
  orderData: any;
  courseId: string;
  courseTitle: string;
  user?: any;
  callbacksRef: { current: { onSuccess?: any; onError?: any; onCancel?: any } };
  cacheKey: string;
}) {
  const keyId =
    orderData.keyId ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "rzp_live_TiFe7K8DqS4FLU";

  return {
    key: keyId,
    amount: orderData.amount, // in paise
    currency: orderData.currency || "INR",
    name: "PrepPath",
    description: `Course Enrollment: ${orderData.course?.title || courseTitle}`,
    order_id: orderData.orderId,
    prefill: {
      name: user?.fullName || user?.name || "",
      email: user?.email || "",
    },
    notes: {
      courseId,
      courseTitle,
    },
    theme: {
      color: "#3157e8",
    },
    handler: async function (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) {
      const verifyToastId = toast.loading("Verifying payment with bank...");
      try {
        const verifyRes = await fetch(`${API_BASE_URL}/api/v1/payments/verify`, {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
          body: JSON.stringify({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            courseId,
          }),
        });

        const verifyData = await verifyRes.json();
        toast.dismiss(verifyToastId);

        if (verifyRes.ok && verifyData.success) {
          preloadedCheckouts.delete(cacheKey);
          toast.success(`🎉 Enrolled successfully in ${courseTitle}!`);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("lms:enrollments-updated", { detail: verifyData }));
            window.dispatchEvent(new CustomEvent("lms:activity-updated"));
          }
          callbacksRef.current.onSuccess?.(verifyData);
        } else {
          const err = verifyData.message || "Payment verification failed";
          toast.error(err);
          callbacksRef.current.onError?.(err);
        }
      } catch (err: any) {
        toast.dismiss(verifyToastId);
        toast.error("Network error during verification. Please contact support.");
        callbacksRef.current.onError?.(err.message || "Verification network error");
      }
    },
    modal: {
      ondismiss: function () {
        toast.info("Payment cancelled.");
        callbacksRef.current.onCancel?.();
      },
    },
  };
}

/**
 * Preload Razorpay order and pre-warm checkout instance in background
 */
export function preloadCheckoutOrder({
  courseId,
  courseTitle = "Course Enrollment",
  price,
  user,
}: {
  courseId: string;
  courseTitle?: string;
  price?: string | number;
  user?: any;
}) {
  if (!courseId) return;
  const cacheKey = `${courseId}_${price || 0}`;
  if (preloadedCheckouts.has(cacheKey)) return;

  const parsedAmount = typeof price === "number" ? price : typeof price === "string" ? parseFloat(price) : undefined;
  const callbacksHolder = { current: {} as any };

  const scriptPromise = loadRazorpayScript();
  const orderPromise = fetch(`${API_BASE_URL}/api/v1/payments/create-order`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({
      courseId,
      amount: parsedAmount,
      type: "COURSE_ENROLLMENT",
    }),
  }).then(async (res) => {
    if (!res.ok) return null;
    return res.json();
  }).catch(() => null);

  const initPromise = Promise.all([orderPromise, scriptPromise]).then(([orderData, isLoaded]) => {
    if (!orderData || !orderData.orderId || !isLoaded || !(window as any).Razorpay) {
      preloadedCheckouts.delete(cacheKey);
      return null;
    }

    const rzpOptions = createRazorpayOptions({
      orderData,
      courseId,
      courseTitle,
      user,
      callbacksRef: callbacksHolder,
      cacheKey,
    });

    try {
      const rzpInstance = new (window as any).Razorpay(rzpOptions);
      rzpInstance.on("payment.failed", function (failResponse: any) {
        preloadedCheckouts.delete(cacheKey);
        toast.error(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
        callbacksHolder.current.onError?.(failResponse.error?.description || "Payment failed");
      });

      const state = preloadedCheckouts.get(cacheKey);
      if (state) {
        state.orderData = orderData;
        state.rzpInstance = rzpInstance;
      }
      return { orderData, rzpInstance };
    } catch {
      return null;
    }
  });

  const stateObj: PreloadedCheckoutState = {
    orderData: null,
    rzpInstance: null,
    promise: initPromise,
    currentCallbacks: callbacksHolder.current,
  };

  preloadedCheckouts.set(cacheKey, stateObj);
}

/**
 * Initiate Razorpay checkout order creation, modal popup, and payment signature verification
 */
export async function initiateRazorpayCheckout({
  courseId,
  courseTitle,
  price,
  user,
  onOpen,
  onSuccess,
  onError,
  onCancel,
}: RazorpayCheckoutOptions) {
  if (!user || !user.email) {
    toast.error("Please sign in or create an account to enroll in courses.");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }, 1000);
    }
    onError?.("User is not authenticated");
    return;
  }

  const parsedAmount = typeof price === "number" ? price : typeof price === "string" ? parseFloat(price) : undefined;
  const cacheKey = `${courseId}_${price || 0}`;

  // 1. Check if a pre-warmed instance is already created in memory
  let cachedState = preloadedCheckouts.get(cacheKey);

  if (cachedState && cachedState.rzpInstance) {
    // Instant 0ms synchronous launch!
    cachedState.currentCallbacks.onSuccess = onSuccess;
    cachedState.currentCallbacks.onError = onError;
    cachedState.currentCallbacks.onCancel = onCancel;
    cachedState.currentCallbacks.onOpen = onOpen;

    try {
      cachedState.rzpInstance.open();
      onOpen?.();
      return;
    } catch {
      // fallback to re-init
      preloadedCheckouts.delete(cacheKey);
    }
  }

  // 2. If in-flight, await the pre-warmed promise
  if (cachedState && cachedState.promise) {
    cachedState.currentCallbacks.onSuccess = onSuccess;
    cachedState.currentCallbacks.onError = onError;
    cachedState.currentCallbacks.onCancel = onCancel;
    cachedState.currentCallbacks.onOpen = onOpen;

    const res = await cachedState.promise;
    if (res && res.rzpInstance) {
      try {
        res.rzpInstance.open();
        onOpen?.();
        return;
      } catch {
        preloadedCheckouts.delete(cacheKey);
      }
    }
  }

  // 3. Fallback: On-demand creation with parallel order + SDK preparation
  const callbacksHolder = {
    current: {
      onSuccess,
      onError,
      onCancel,
      onOpen,
    },
  };

  const scriptPromise = loadRazorpayScript();
  const orderPromise = fetch(`${API_BASE_URL}/api/v1/payments/create-order`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify({
      courseId,
      amount: parsedAmount,
      type: "COURSE_ENROLLMENT",
    }),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to initialize payment order");
    }
    return data;
  });

  try {
    const [orderData, isLoaded] = await Promise.all([orderPromise, scriptPromise]);

    if (!orderData || !orderData.orderId) {
      preloadedCheckouts.delete(cacheKey);
      toast.error("Failed to initialize payment order");
      onError?.("Failed to initialize payment order");
      return;
    }

    if (!isLoaded || !(window as any).Razorpay) {
      toast.error("Could not connect to Razorpay. Please check your internet connection.");
      onError?.("Razorpay SDK load error");
      return;
    }

    const rzpOptions = createRazorpayOptions({
      orderData,
      courseId,
      courseTitle,
      user,
      callbacksRef: callbacksHolder,
      cacheKey,
    });

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on("payment.failed", function (failResponse: any) {
      preloadedCheckouts.delete(cacheKey);
      toast.error(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
      callbacksHolder.current.onError?.(failResponse.error?.description || "Payment failed");
    });

    rzp.open();
    onOpen?.();
  } catch (error: any) {
    preloadedCheckouts.delete(cacheKey);
    const msg = error.message || "An unexpected error occurred during checkout";
    toast.error(msg);
    onError?.(msg);
  }
}
