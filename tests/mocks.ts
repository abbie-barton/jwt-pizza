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
    } 

    else if (method === "DELETE") {
        state.loggedInUser = undefined;
        await route.fulfill({ json: { message: "logged out" } })
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

export async function mockFranchises(page: Page) {
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
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
        { id: 3, name: "PizzaCorp", stores: [{ id: 7, name: "Spanish Fork" }] },
        { id: 4, name: "topSpot", stores: [] },
      ],
    };
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: franchiseRes });
  });
}

export async function mockOrder(page: Page) {
  await page.route("*/**/api/order", async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: "eyJpYXQ",
    };
    expect(route.request().method()).toBe("POST");
    await route.fulfill({ json: orderRes });
  });
}

export default async function basicInit(page: Page) {
  const state = createMockState();
  await mockAuth(page, state);
  await mockUserMe(page, state);
  await mockMenu(page);
  await mockFranchises(page);
  await mockOrder(page);
  await page.goto("/");
  return state;
}
