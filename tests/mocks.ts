import { Page } from "@playwright/test";
import { expect } from "./testSetup";
import { Role, User } from "../src/service/pizzaService";

type MockState = {
  loggedInUser?: User;
  validUsers: Record<string, User>;
};

function createMockState(): MockState {
  return {
    validUsers: {
      "d@jwt.com": {
        id: "3",
        name: "Kai Chen",
        email: "d@jwt.com",
        password: "a",
        roles: [{ role: Role.Diner }],
      },
      "a@jwt.com": {
        id: "10",
        name: "The True Admin",
        email: "a@jwt.com",
        password: "admin",
        roles: [{ role: Role.Admin }],
      },
      "f@jwt.com": {
        id: "15",
        name: "The True Franchisee",
        email: "f@jwt.com",
        password: "franchisee",
        roles: [{ role: Role.Franchisee }],
      },
    },
  };
}

export async function mockAuth(page: Page, state: MockState) {
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "PUT") {
      const loginReq = route.request().postDataJSON();
      const user = state.validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
        return;
      }
      state.loggedInUser = user;
      await route.fulfill({ json: { user, token: "abcdef" } });
    } else if (method === "POST") {
      const registerReq = route.request().postDataJSON();
      const { name, email, password } = registerReq;
      if (!email || !password) {
        await route.fulfill({
          status: 401,
          json: { error: "Incomplete information" },
        });
        return;
      }
      const newUser: User = {
        id: "4",
        name,
        email,
        password,
        roles: [{ role: Role.Diner }],
      };
      state.validUsers[email] = newUser;
      state.loggedInUser = newUser;
      await route.fulfill({ json: { user: newUser, token: "testPizzaToken" } });
    } else if (method === "DELETE") {
      state.loggedInUser = undefined;
      await route.fulfill({ json: { message: "logged out" } });
    }
  });
}

export async function mockUserMe(page: Page, state: MockState) {
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: state.loggedInUser });
  });
}

export async function mockMenu(page: Page) {
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });
}

export async function mockFranchises(page: Page, state: MockState) {
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: "LotaPizza",
            stores: [
              { id: 4, name: "Lehi" },
              { id: 5, name: "Springville" },
              { id: 6, name: "American Fork" },
            ],
          },
          {
            id: 3,
            name: "PizzaCorp",
            stores: [{ id: 7, name: "Spanish Fork" }],
          },
          { id: 4, name: "topSpot", stores: [] },
        ],
      };
      await route.fulfill({ json: franchiseRes });
    } else if (method === "POST") {
      const req = route.request().postDataJSON();
      const { name, admins } = req;
      if (!name || !admins || admins.length === 0) {
        await route.fulfill({
          status: 401,
          json: { error: "Incomplete information" },
        });
        return;
      }

      const adminUser = state.validUsers[admins[0].email];
      await route.fulfill({
        json: {
          name: name,
          admins: [
            { email: adminUser.email, id: adminUser.id, name: adminUser.name },
          ],
          id: 1,
        },
      });
    }
  });

  await page.route("*/**/api/franchise/*", async (route) => {
    const method = route.request().method();
    if (method === "DELETE") {
      await route.fulfill({ json: { message: "franchise deleted" } });
    } else if (method === "GET") {
      await route.fulfill({
        json: [
          {
            id: 2,
            name: "LotaPizza",
            admins: [
              { id: 15, name: "The True Franchisee", email: "f@jwt.com" },
            ],
            stores: [{ id: 4, name: "Lehi", totalRevenue: 0.05 }],
          },
        ],
      });
    }
  });

  await page.route("*/**/api/franchise/*/store", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      const req = route.request().postDataJSON();
      const { franchiseId, name } = req;
      if (!name || !franchiseId) {
        await route.fulfill({
          status: 401,
          json: { error: "Incomplete information" },
        });
        return;
      }

      await route.fulfill({
        json: {
          id: 1,
          name: name,
          totalRevenue: 0,
        },
      });
    }
  });

  await page.route("*/**/api/franchise/*/store/*", async (route) => {
    const method = route.request().method();
    if (method === "DELETE") {
      await route.fulfill({ json: { message: "store deleted" } });
    }
  });
}

export async function mockOrder(page: Page) {
  await page.route("*/**/api/order", async (route) => {
    const method = route.request().method();
    if (method === "POST") {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: "eyJpYXQ",
      };
      await route.fulfill({ json: orderRes });
    } else if (method === "GET") {
      await route.fulfill({
        json: {
          dinerId: 4,
          orders: [
            {
              id: 1,
              franchiseId: 1,
              storeId: 1,
              date: "2024-06-05T05:14:40.000Z",
              items: [{ id: 1, menuId: 1, description: "Veggie", price: 0.05 }],
            },
          ],
          page: 1,
        },
      });
    }
  });
}

export default async function basicInit(page: Page) {
  const state = createMockState();
  await mockAuth(page, state);
  await mockUserMe(page, state);
  await mockMenu(page);
  await mockFranchises(page, state);
  await mockOrder(page);
  await page.goto("/");
  return state;
}
