import fs from 'fs';
import { Prisma } from '@prisma/client';

const dmmf = Prisma.dmmf;
const models = dmmf.datamodel.models;

const collection = {
  info: {
    name: "Lukeattisha Server API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  variable: [
    { key: "baseUrl", value: "http://10.10.7.111:4000/api/v1" },
    { key: "adminAccessToken", value: "" },
    { key: "userAccessToken", value: "" },
    { key: "operatorAccessToken", value: "" }
  ],
  item: [] as any[]
};

// Map Prisma types to dummy data
function getDummyData(type: string, name: string) {
  if (type === 'String') return name.toLowerCase().includes('email') ? 'user@example.com' : 'string';
  if (type === 'Int' || type === 'Float') return 1;
  if (type === 'Boolean') return true;
  if (type === 'DateTime') return new Date().toISOString();
  if (type === 'Json') return {};
  return `[${type}]`; // enum or relation
}

models.forEach(model => {
  const folder = {
    name: model.name,
    item: [] as any[]
  };

  const createPayload: any = {};
  const updatePayload: any = {};

  model.fields.forEach(f => {
    if (!f.isId && !f.isGenerated && !f.isUpdatedAt && f.relationName === undefined) {
      if (f.isRequired && !f.hasDefaultValue) {
        createPayload[f.name] = getDummyData(f.type, f.name);
      }
      updatePayload[f.name] = getDummyData(f.type, f.name);
    }
  });

  // Base route is mostly lowercase of model name
  const routeName = model.name.toLowerCase();

  // Create
  if (Object.keys(createPayload).length > 0) {
    folder.item.push({
      name: `Create ${model.name}`,
      request: {
        method: "POST",
        header: [
            { key: "Authorization", value: "{{adminAccessToken}}", type: "text" },
            { key: "Content-Type", value: "application/json", type: "text" }
        ],
        url: {
          raw: `{{baseUrl}}/${routeName}`,
          host: ["{{baseUrl}}"],
          path: [routeName]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(createPayload, null, 2)
        }
      }
    });
  }

  // Update
  if (Object.keys(updatePayload).length > 0) {
    folder.item.push({
      name: `Update ${model.name}`,
      request: {
        method: "PATCH",
        header: [
            { key: "Authorization", value: "{{adminAccessToken}}", type: "text" },
            { key: "Content-Type", value: "application/json", type: "text" }
        ],
        url: {
          raw: `{{baseUrl}}/${routeName}/:id`,
          host: ["{{baseUrl}}"],
          path: [routeName, ":id"],
          variable: [{ key: "id", value: "1" }]
        },
        body: {
          mode: "raw",
          raw: JSON.stringify(updatePayload, null, 2)
        }
      }
    });
  }

  // Fetch All
  folder.item.push({
    name: `Get ${model.name}s`,
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "{{adminAccessToken}}", type: "text" }],
      url: { raw: `{{baseUrl}}/${routeName}`, host: ["{{baseUrl}}"], path: [routeName] }
    }
  });

  // Fetch Single
  folder.item.push({
    name: `Get ${model.name} By Id`,
    request: {
      method: "GET",
      header: [{ key: "Authorization", value: "{{adminAccessToken}}", type: "text" }],
      url: { raw: `{{baseUrl}}/${routeName}/:id`, host: ["{{baseUrl}}"], path: [routeName, ":id"], variable: [{ key: "id", value: "1" }] }
    }
  });

   // Delete
  folder.item.push({
    name: `Delete ${model.name}`,
    request: {
      method: "DELETE",
      header: [{ key: "Authorization", value: "{{adminAccessToken}}", type: "text" }],
      url: { raw: `{{baseUrl}}/${routeName}/:id`, host: ["{{baseUrl}}"], path: [routeName, ":id"], variable: [{ key: "id", value: "1" }] }
    }
  });

  collection.item.push(folder);
});

const authFolder = {
    name: "Auth",
    item: [
        {
            name: "Login",
            request: {
                method: "POST",
                header: [{ key: "Content-Type", value: "application/json", type: "text" }],
                url: { raw: `{{baseUrl}}/auth/login`, host: ["{{baseUrl}}"], path: ["auth", "login"] },
                body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com", password: "password123" }, null, 2) }
            }
        },
        {
            name: "Register",
            request: {
                method: "POST",
                header: [{ key: "Content-Type", value: "application/json", type: "text" }],
                url: { raw: `{{baseUrl}}/auth/register`, host: ["{{baseUrl}}"], path: ["auth", "register"] },
                body: { mode: "raw", raw: JSON.stringify({ email: "user@example.com", name: "string", password: "password123", contact_no: "string", address: "string" }, null, 2) }
            }
        }
    ]
};
collection.item.unshift(authFolder);

fs.writeFileSync('postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Postman collection generated at postman_collection.json');
