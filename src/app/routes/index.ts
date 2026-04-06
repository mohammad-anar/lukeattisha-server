import { UserSubscriptionRouter } from '../modules/userSubscription/userSubscription.routes.js';
import { UserSubscriptionPlanRouter } from '../modules/userSubscriptionPlan/userSubscriptionPlan.routes.js';
import { AdRouter } from '../modules/ad/ad.routes.js';
import { AdSubscriptionRouter } from '../modules/adSubscription/adSubscription.routes.js';
import { AdSubscriptionPlanRouter } from '../modules/adSubscriptionPlan/adSubscriptionPlan.routes.js';
import { NotificationRouter } from '../modules/notification/notification.routes.js';
import { BannerRouter } from '../modules/banner/banner.routes.js';
import { AdminSettingRouter } from '../modules/adminSetting/adminSetting.routes.js';
import { ChatMessageRouter } from '../modules/chatMessage/chatMessage.routes.js';
import { ChatParticipantRouter } from '../modules/chatParticipant/chatParticipant.routes.js';
import { ChatRoomRouter } from '../modules/chatRoom/chatRoom.routes.js';
import { SupportTicketRouter } from '../modules/supportTicket/supportTicket.routes.js';
import { ReviewRouter } from '../modules/review/review.routes.js';
import { AdminWalletTransactionRouter } from '../modules/adminWalletTransaction/adminWalletTransaction.routes.js';
import { AdminWalletRouter } from '../modules/adminWallet/adminWallet.routes.js';
import { OperatorWalletTransactionRouter } from '../modules/operatorWalletTransaction/operatorWalletTransaction.routes.js';
import { WithdrawalRouter } from '../modules/withdrawal/withdrawal.routes.js';
import { OperatorWalletRouter } from '../modules/operatorWallet/operatorWallet.routes.js';
import { UserPaymentCardRouter } from '../modules/userPaymentCard/userPaymentCard.routes.js';
import { PaymentRouter } from '../modules/payment/payment.routes.js';
import { OrderItemRouter } from '../modules/orderItem/orderItem.routes.js';
import { OrderRouter } from '../modules/order/order.routes.js';
import { CartItemRouter } from '../modules/cartItem/cartItem.routes.js';
import { CartRouter } from '../modules/cart/cart.routes.js';
import { BundleRouter } from '../modules/bundle/bundle.routes.js';
import { StoreServiceRouter } from '../modules/storeService/storeService.routes.js';
import { StoreRouter } from '../modules/store/store.routes.js';
import { FavouriteServiceRouter } from '../modules/favouriteService/favouriteService.routes.js';
import { AddonRouter } from '../modules/addon/addon.routes.js';
import { ServiceAddonRouter } from '../modules/serviceAddon/serviceAddon.routes.js';
import { ServiceRouter } from '../modules/service/service.routes.js';
import { OperatorCategoryRouter } from '../modules/operatorCategory/operatorCategory.routes.js';
import { CategoryRouter } from '../modules/category/category.routes.js';
import { AddressRouter } from '../modules/address/address.routes.js';
import { OperatorRouter } from '../modules/operator/operator.routes.js';
import { UserRouter } from '../modules/user/user.routes.js';
import express from 'express';
import { AuthRouter } from '../modules/auth/auth.routes.js';
import { StoreBundleRouter } from 'app/modules/storeBundle/storeBundle.routes.js';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRouter },
  { path: '/user', route: UserRouter },
  { path: '/operator', route: OperatorRouter },
  { path: '/address', route: AddressRouter },
  { path: '/category', route: CategoryRouter },
  { path: '/operatorcategory', route: OperatorCategoryRouter },
  { path: '/service', route: ServiceRouter },
  { path: '/serviceaddon', route: ServiceAddonRouter },
  { path: '/addon', route: AddonRouter },
  { path: '/favouriteservice', route: FavouriteServiceRouter },
  { path: '/store', route: StoreRouter },
  { path: '/storeservice', route: StoreServiceRouter },
  { path: '/storebundle', route: StoreBundleRouter },
  { path: '/bundle', route: BundleRouter },
  { path: '/cart', route: CartRouter },
  { path: '/cartitem', route: CartItemRouter },
  { path: '/order', route: OrderRouter },
  { path: '/orderitem', route: OrderItemRouter },
  { path: '/payment', route: PaymentRouter },
  { path: '/userpaymentcard', route: UserPaymentCardRouter },
  { path: '/operatorwallet', route: OperatorWalletRouter },
  { path: '/withdrawal', route: WithdrawalRouter },
  { path: '/operatorwallettransaction', route: OperatorWalletTransactionRouter },
  { path: '/adminwallet', route: AdminWalletRouter },
  { path: '/adminwallettransaction', route: AdminWalletTransactionRouter },
  { path: '/review', route: ReviewRouter },
  { path: '/supportticket', route: SupportTicketRouter },
  { path: '/chatroom', route: ChatRoomRouter },
  { path: '/chatparticipant', route: ChatParticipantRouter },
  { path: '/chatmessage', route: ChatMessageRouter },
  { path: '/adminsetting', route: AdminSettingRouter },
  { path: '/banner', route: BannerRouter },
  { path: '/notification', route: NotificationRouter },
  { path: '/adsubscriptionplan', route: AdSubscriptionPlanRouter },
  { path: '/adsubscription', route: AdSubscriptionRouter },
  { path: '/ad', route: AdRouter },
  { path: '/usersubscriptionplan', route: UserSubscriptionPlanRouter },
  { path: '/usersubscription', route: UserSubscriptionRouter },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
