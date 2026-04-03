import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  { name: 'user', pascalName: 'User' },
  { name: 'operator', pascalName: 'Operator' },
  { name: 'address', pascalName: 'Address' },
  { name: 'category', pascalName: 'Category' },
  { name: 'operatorCategory', pascalName: 'OperatorCategory' },
  { name: 'service', pascalName: 'Service' },
  { name: 'serviceAddon', pascalName: 'ServiceAddon' },
  { name: 'addon', pascalName: 'Addon' },
  { name: 'favouriteService', pascalName: 'FavouriteService' },
  { name: 'store', pascalName: 'Store' },
  { name: 'storeService', pascalName: 'StoreService' },
  { name: 'bundle', pascalName: 'Bundle' },
  { name: 'cart', pascalName: 'Cart' },
  { name: 'cartItem', pascalName: 'CartItem' },
  { name: 'order', pascalName: 'Order' },
  { name: 'orderItem', pascalName: 'OrderItem' },
  { name: 'payment', pascalName: 'Payment' },
  { name: 'userPaymentCard', pascalName: 'UserPaymentCard' },
  { name: 'operatorWallet', pascalName: 'OperatorWallet' },
  { name: 'withdrawal', pascalName: 'Withdrawal' },
  { name: 'operatorWalletTransaction', pascalName: 'OperatorWalletTransaction' },
  { name: 'adminWallet', pascalName: 'AdminWallet' },
  { name: 'adminWalletTransaction', pascalName: 'AdminWalletTransaction' },
  { name: 'review', pascalName: 'Review' },
  { name: 'supportTicket', pascalName: 'SupportTicket' },
  { name: 'chatRoom', pascalName: 'ChatRoom' },
  { name: 'chatParticipant', pascalName: 'ChatParticipant' },
  { name: 'chatMessage', pascalName: 'ChatMessage' },
  { name: 'adminSetting', pascalName: 'AdminSetting' },
  { name: 'banner', pascalName: 'Banner' },
  { name: 'notification', pascalName: 'Notification' },
  { name: 'adSubscriptionPlan', pascalName: 'AdSubscriptionPlan' },
  { name: 'adSubscription', pascalName: 'AdSubscription' },
  { name: 'ad', pascalName: 'Ad' },
  { name: 'userSubscriptionPlan', pascalName: 'UserSubscriptionPlan' },
  { name: 'userSubscription', pascalName: 'UserSubscription' }
];

const modulesDir = path.join(__dirname, 'src', 'app', 'modules');

const getControllerTemplate = function(name, pascalName) {
  return "import { Request, Response } from 'express';\n" +
  "import catchAsync from '../../shared/catchAsync.js';\n" +
  "import sendResponse from '../../shared/sendResponse.js';\n" +
  "import { " + pascalName + "Service } from './" + name + ".service.js';\n\n" +
  "const create = catchAsync(async (req: Request, res: Response) => {\n" +
  "  const result = await " + pascalName + "Service.create(req.body);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 201,\n" +
  "    message: '" + pascalName + " created successfully',\n" +
  "    data: result,\n" +
  "  });\n" +
  "});\n\n" +
  "const getAll = catchAsync(async (req: Request, res: Response) => {\n" +
  "  const result = await " + pascalName + "Service.getAll(req.query);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 200,\n" +
  "    message: '" + pascalName + " fetched successfully',\n" +
  "    data: result,\n" +
  "  });\n" +
  "});\n\n" +
  "const getById = catchAsync(async (req: Request, res: Response) => {\n" +
  "  const result = await " + pascalName + "Service.getById(req.params.id);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 200,\n" +
  "    message: '" + pascalName + " fetched successfully',\n" +
  "    data: result,\n" +
  "  });\n" +
  "});\n\n" +
  "const update = catchAsync(async (req: Request, res: Response) => {\n" +
  "  const result = await " + pascalName + "Service.update(req.params.id, req.body);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 200,\n" +
  "    message: '" + pascalName + " updated successfully',\n" +
  "    data: result,\n" +
  "  });\n" +
  "});\n\n" +
  "const deleteById = catchAsync(async (req: Request, res: Response) => {\n" +
  "  const result = await " + pascalName + "Service.deleteById(req.params.id);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 200,\n" +
  "    message: '" + pascalName + " deleted successfully',\n" +
  "    data: result,\n" +
  "  });\n" +
  "});\n\n" +
  "export const " + pascalName + "Controller = {\n" +
  "  create,\n" +
  "  getAll,\n" +
  "  getById,\n" +
  "  update,\n" +
  "  deleteById,\n" +
  "};\n";
};

const getServiceTemplate = function(name, pascalName) {
  return "import { prisma } from '../../../helpers.ts/prisma.js';\n" +
  "import ApiError from '../../../errors/ApiError.js';\n\n" +
  "const create = async (payload: any) => {\n" +
  "  const result = await prisma." + name + ".create({\n" +
  "    data: payload,\n" +
  "  });\n" +
  "  return result;\n" +
  "};\n\n" +
  "const getAll = async (query: any) => {\n" +
  "  const result = await prisma." + name + ".findMany();\n" +
  "  return result;\n" +
  "};\n\n" +
  "const getById = async (id: string) => {\n" +
  "  const result = await prisma." + name + ".findUnique({\n" +
  "    where: { id },\n" +
  "  });\n" +
  "  if (!result) {\n" +
  "    throw new ApiError(404, '" + pascalName + " not found');\n" +
  "  }\n" +
  "  return result;\n" +
  "};\n\n" +
  "const update = async (id: string, payload: any) => {\n" +
  "  await getById(id);\n" +
  "  const result = await prisma." + name + ".update({\n" +
  "    where: { id },\n" +
  "    data: payload,\n" +
  "  });\n" +
  "  return result;\n" +
  "};\n\n" +
  "const deleteById = async (id: string) => {\n" +
  "  await getById(id);\n" +
  "  const result = await prisma." + name + ".delete({\n" +
  "    where: { id },\n" +
  "  });\n" +
  "  return result;\n" +
  "};\n\n" +
  "export const " + pascalName + "Service = {\n" +
  "  create,\n" +
  "  getAll,\n" +
  "  getById,\n" +
  "  update,\n" +
  "  deleteById,\n" +
  "};\n";
};

const getRoutesTemplate = function(name, pascalName) {
  return "import express from 'express';\n" +
  "import { " + pascalName + "Controller } from './" + name + ".controller.js';\n" +
  "// import validateRequest from '../../middlewares/validateRequest.js';\n" +
  "// import { " + pascalName + "Validation } from './" + name + ".validation.js';\n\n" +
  "const router = express.Router();\n\n" +
  "router.post('/', " + pascalName + "Controller.create);\n" +
  "router.get('/', " + pascalName + "Controller.getAll);\n" +
  "router.get('/:id', " + pascalName + "Controller.getById);\n" +
  "router.patch('/:id', " + pascalName + "Controller.update);\n" +
  "router.delete('/:id', " + pascalName + "Controller.deleteById);\n\n" +
  "export const " + pascalName + "Router = router;\n";
};

const getValidationTemplate = function(name, pascalName) {
  return "import { z } from 'zod';\n\n" +
  "const createSchema = z.object({\n" +
  "  // Add validation fields here\n" +
  "});\n\n" +
  "const updateSchema = z.object({\n" +
  "  // Add validation fields here\n" +
  "}).partial();\n\n" +
  "export const " + pascalName + "Validation = {\n" +
  "  createSchema,\n" +
  "  updateSchema,\n" +
  "};\n";
};

if (!fs.existsSync(modulesDir)) fs.mkdirSync(modulesDir, { recursive: true });

models.forEach(model => {
  const dir = path.join(modulesDir, model.name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  if (model.name !== 'auth') {
    fs.writeFileSync(path.join(dir, model.name + '.controller.ts'), getControllerTemplate(model.name, model.pascalName));
    fs.writeFileSync(path.join(dir, model.name + '.service.ts'), getServiceTemplate(model.name, model.pascalName));
    fs.writeFileSync(path.join(dir, model.name + '.routes.ts'), getRoutesTemplate(model.name, model.pascalName));
    fs.writeFileSync(path.join(dir, model.name + '.validation.ts'), getValidationTemplate(model.name, model.pascalName));
  }
});

// Update index.ts routes
const routesIndexPath = path.join(__dirname, 'src', 'app', 'routes', 'index.ts');
let indexContent = "import express from 'express';\nimport { AuthRouter } from '../modules/auth/auth.routes.js';\n\nconst router = express.Router();\n";

models.forEach(model => {
  if (model.name !== 'auth') {
    const importStatement = "import { " + model.pascalName + "Router } from '../modules/" + model.name + "/" + model.name + ".routes.js';";
    indexContent = importStatement + "\n" + indexContent;
  }
});

indexContent += "\nconst moduleRoutes = [\n  { path: '/auth', route: AuthRouter },\n";
models.forEach(model => {
  if (model.name !== 'auth') {
    indexContent += "  { path: '/" + model.name.toLowerCase() + "', route: " + model.pascalName + "Router },\n";
  }
});
indexContent += "];\n\nmoduleRoutes.forEach((route) => router.use(route.path, route.route));\n\nexport default router;\n";

fs.writeFileSync(routesIndexPath, indexContent);
console.log('Successfully generated all components and updated routes.');
