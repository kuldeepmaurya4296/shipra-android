declare module 'react-native-razorpay' {
    export interface RazorpayOptions {
        description: string;
        image: string;
        currency: string;
        key: string;
        amount: number; // in paise
        name: string;
        prefill?: {
            email: string;
            contact: string;
            name?: string;
        };
        theme?: {
            color: string;
        };
        order_id?: string;
    }

    export interface RazorpaySuccessData {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
    }

    export interface RazorpayError {
        code: number;
        description: string;
    }

    const RazorpayCheckout: {
        open: (options: RazorpayOptions) => Promise<RazorpaySuccessData>;
    };

    export default RazorpayCheckout;
}
