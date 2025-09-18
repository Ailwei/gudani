import Stripe from "stripe";

declare module "stripe" {
  namespace Stripe {
    interface Invoice {
      subscription?: string | Stripe.Subscription | null;
    }
  }
}
