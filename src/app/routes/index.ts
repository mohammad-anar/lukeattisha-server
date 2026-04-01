import express from "express";
import { AuthRouter } from "../modules/auth/auth.routes.js";
import { UserRouter } from "../modules/user/user.routes.js";
import { CategoryRouter } from "../modules/category/category.routes.js";
import { FavoriteRouter } from "../modules/favorite/favorite.routes.js";
import { OperatorRouter } from "../modules/operator/operator.routes.js";
import { ServiceRouter } from "../modules/service/service.routes.js";
import { OrderRouter } from "../modules/order/order.routes.js";
import { ReviewRouter } from "../modules/review/review.routes.js";
import { PaymentRouter } from "../modules/payment/payment.routes.js";
import { SubscriptionRouter } from "../modules/subscription/subscription.routes.js";
import { NotificationRouter } from "../modules/notification/notification.routes.js";
import { AdminRouter } from "../modules/admin/admin.routes.js";
import { ChatRouter } from "../modules/chat/chat.routes.js";
import { UserAddressRouter } from "../modules/address/address.routes.js";
import { PayoutRouter } from "../modules/payout/payout.routes.js";
import { WalletRouter } from "../modules/wallet/wallet.routes.js";
import { TicketRouter } from "../modules/ticket/ticket.routes.js";
import { BannerRouter } from "../modules/banner/banner.routes.js";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRouter },
  { path: "/user", route: UserRouter },
  { path: "/operator", route: OperatorRouter },
  { path: "/service", route: ServiceRouter },
  { path: "/category", route: CategoryRouter },
  { path: "/favorite", route: FavoriteRouter },
  { path: "/order", route: OrderRouter },
  { path: "/review", route: ReviewRouter },
  { path: "/payment", route: PaymentRouter },
  { path: "/subscription", route: SubscriptionRouter },
  { path: "/notification", route: NotificationRouter },
  { path: "/admin", route: AdminRouter },
  { path: "/chat", route: ChatRouter },
  { path: "/address", route: UserAddressRouter },
  { path: "/payout", route: PayoutRouter },
  { path: "/wallet", route: WalletRouter },
  { path: "/ticket", route: TicketRouter },
  { path: "/banner", route: BannerRouter },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
