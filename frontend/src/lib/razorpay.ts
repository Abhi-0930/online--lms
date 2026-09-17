import { toast } from "sonner";

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
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Dynamically load Razorpay standard checkout script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiate Razorpay checkout order creation, modal popup, and payment signature verification
 */
export async function initiateRazorpayCheckout({
  courseId,
  courseTitle,
  price,
  user,
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

  const toastId = toast.loading(`Preparing checkout for ${courseTitle}...`);

  try {
    // 1. Create order on LMS Backend
    const orderRes = await fetch("http://localhost:4000/api/v1/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        courseId,
        type: "COURSE_ENROLLMENT",
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      toast.dismiss(toastId);
      if (orderRes.status === 409 || orderData.code === "ALREADY_ENROLLED") {
        toast.info("You are already enrolled in this course!");
        onSuccess?.({ alreadyEnrolled: true });
        return;
      }
      const errMsg = orderData.message || "Failed to initialize payment order";
      toast.error(errMsg);
      onError?.(errMsg);
      return;
    }

    // 2. Ensure Razorpay SDK is ready
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.dismiss(toastId);
      toast.error("Could not connect to Razorpay. Please check your internet connection.");
      onError?.("Razorpay SDK load error");
      return;
    }

    toast.dismiss(toastId);

    const keyId =
      orderData.keyId ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_TdCqxAwhikrJPk";

    // 3. Configure Razorpay modal options
    const rzpOptions = {
      key: keyId,
      amount: orderData.amount, // in paise
      currency: orderData.currency || "INR",
      name: "Skillforge LMS",
      description: `Course Enrollment: ${orderData.course?.title || courseTitle}`,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&q=80",
      order_id: orderData.orderId,
      prefill: {
        name: user.fullName || user.name || "",
        email: user.email || "",
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
          // 4. Verify signature on LMS backend
          const verifyRes = await fetch("http://localhost:4000/api/v1/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            toast.success(`🎉 Enrolled successfully in ${courseTitle}!`);
            onSuccess?.(verifyData);
          } else {
            const err = verifyData.message || "Payment verification failed";
            toast.error(err);
            onError?.(err);
          }
        } catch (err: any) {
          toast.dismiss(verifyToastId);
          toast.error("Network error during verification. Please contact support.");
          onError?.(err.message || "Verification network error");
        }
      },
      modal: {
        ondismiss: function () {
          toast.info("Payment cancelled.");
          onCancel?.();
        },
      },
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on("payment.failed", function (failResponse: any) {
      toast.error(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
      onError?.(failResponse.error?.description || "Payment failed");
    });
    rzp.open();
  } catch (error: any) {
    toast.dismiss(toastId);
    const msg = error.message || "An unexpected error occurred during checkout";
    toast.error(msg);
    onError?.(msg);
  }
}
