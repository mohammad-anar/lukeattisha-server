import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = [
  { name: 'user', pascalName: 'User', search: ['name', 'email', 'phone'] },
  { name: 'operator', pascalName: 'Operator', search: [] },
  { name: 'address', pascalName: 'Address', search: ['streetAddress', 'city', 'country'] },
  { name: 'category', pascalName: 'Category', search: ['name'] },
  { name: 'operatorCategory', pascalName: 'OperatorCategory', search: [] },
  { name: 'service', pascalName: 'Service', search: ['name', 'description'] },
  { name: 'serviceAddon', pascalName: 'ServiceAddon', search: [] },
  { name: 'addon', pascalName: 'Addon', search: ['name'] },
  { name: 'favouriteService', pascalName: 'FavouriteService', search: [] },
  { name: 'store', pascalName: 'Store', search: ['name', 'address', 'city'] },
  { name: 'storeService', pascalName: 'StoreService', search: [] },
  { name: 'bundle', pascalName: 'Bundle', search: ['name', 'description'] },
  { name: 'cart', pascalName: 'Cart', search: [] },
  { name: 'cartItem', pascalName: 'CartItem', search: [] },
  { name: 'order', pascalName: 'Order', search: ['orderNumber'] },
  { name: 'orderItem', pascalName: 'OrderItem', search: ['serviceName'] },
  { name: 'payment', pascalName: 'Payment', search: [] },
  { name: 'userPaymentCard', pascalName: 'UserPaymentCard', search: ['last4', 'brand'] },
  { name: 'operatorWallet', pascalName: 'OperatorWallet', search: [] },
  { name: 'withdrawal', pascalName: 'Withdrawal', search: [] },
  { name: 'operatorWalletTransaction', pascalName: 'OperatorWalletTransaction', search: [] },
  { name: 'adminWallet', pascalName: 'AdminWallet', search: [] },
  { name: 'adminWalletTransaction', pascalName: 'AdminWalletTransaction', search: [] },
  { name: 'review', pascalName: 'Review', search: ['comment'] },
  { name: 'supportTicket', pascalName: 'SupportTicket', search: ['ticketNumber', 'subject', 'description'] },
  { name: 'chatRoom', pascalName: 'ChatRoom', search: ['name'] },
  { name: 'chatParticipant', pascalName: 'ChatParticipant', search: [] },
  { name: 'chatMessage', pascalName: 'ChatMessage', search: ['content'] },
  { name: 'adminSetting', pascalName: 'AdminSetting', search: [] },
  { name: 'banner', pascalName: 'Banner', search: ['title'] },
  { name: 'notification', pascalName: 'Notification', search: ['title', 'message'] },
  { name: 'adSubscriptionPlan', pascalName: 'AdSubscriptionPlan', search: ['name'] },
  { name: 'adSubscription', pascalName: 'AdSubscription', search: [] },
  { name: 'ad', pascalName: 'Ad', search: [] },
  { name: 'userSubscriptionPlan', pascalName: 'UserSubscriptionPlan', search: ['name'] },
  { name: 'userSubscription', pascalName: 'UserSubscription', search: [] }
];

const modulesDir = path.join(__dirname, 'src', 'app', 'modules');

const getControllerTemplate = function(name, pascalName) {
  return "import { Request, Response } from 'express';\n" +
  "import catchAsync from '../../shared/catchAsync.js';\n" +
  "import sendResponse from '../../shared/sendResponse.js';\n" +
  "import { " + pascalName + "Service } from './" + name + ".service.js';\n" +
  "import pick from '../../../helpers.ts/pick.js';\n\n" +
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
  "  const filters = pick(req.query, ['searchTerm', 'isActive', 'role', 'status']); // Customize filters as needed\n" +
  "  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);\n" +
  "  const result = await " + pascalName + "Service.getAll(filters, options);\n" +
  "  sendResponse(res, {\n" +
  "    success: true,\n" +
  "    statusCode: 200,\n" +
  "    message: '" + pascalName + " fetched successfully',\n" +
  "    meta: result.meta,\n" +
  "    data: result.data,\n" +
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

const getServiceTemplate = function(name, pascalName, searchFields) {
  const searchFieldsString = JSON.stringify(searchFields);
  
  return "import { prisma } from '../../../helpers.ts/prisma.js';\n" +
  "import ApiError from '../../../errors/ApiError.js';\n" +
  "import { paginationHelper } from '../../../helpers.ts/paginationHelper.js';\n" +
  "import { Prisma } from '@prisma/client';\n\n" +
  "const create = async (payload: any) => {\n" +
  "  const result = await prisma." + name + ".create({\n" +
  "    data: payload,\n" +
  "  });\n" +
  "  return result;\n" +
  "};\n\n" +
  "const getAll = async (filters: any, options: any) => {\n" +
  "  const { limit, page, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);\n" +
  "  const { searchTerm, ...filterData } = filters;\n\n" +
  "  const andConditions = [];\n\n" +
  "  if (searchTerm) {\n" +
  "    andConditions.push({\n" +
  "      OR: " + searchFieldsString + ".map((field) => ({\n" +
  "        [field]: {\n" +
  "          contains: searchTerm,\n" +
  "          mode: 'insensitive',\n" +
  "        },\n" +
  "      })),\n" +
  "    });\n" +
  "  }\n\n" +
  "  if (Object.keys(filterData).length > 0) {\n" +
  "    andConditions.push({\n" +
  "      AND: Object.keys(filterData).map((key) => ({\n" +
  "        [key]: {\n" +
  "          equals: (filterData as any)[key],\n" +
  "        },\n" +
  "      })),\n" +
  "    });\n" +
  "  }\n\n" +
  "  const whereConditions: Prisma." + pascalName + "WhereInput = andConditions.length > 0 ? { AND: andConditions } : {};\n\n" +
  "  const result = await prisma." + name + ".findMany({\n" +
  "    where: whereConditions,\n" +
  "    skip,\n" +
  "    take: limit,\n" +
  "    orderBy:\n" +
  "      sortBy && sortOrder\n" +
  "        ? { [sortBy]: sortOrder }\n" +
  "        : { createdAt: 'desc' },\n" +
  "  });\n" +
  "  const total = await prisma." + name + ".count({ where: whereConditions });\n\n" +
  "  return {\n" +
  "    meta: {\n" +
  "      total,\n" +
  "      page,\n" +
  "      limit,\n" +
  "    },\n" +
  "    data: result,\n" +
  "  };\n" +
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
    fs.writeFileSync(path.join(dir, model.name + '.service.ts'), getServiceTemplate(model.name, model.pascalName, model.search));
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
