import { describe, it, expect } from "@jest/globals";
import connectionGenerator from '../../src/database/init-db';
import { Database } from "sqlite3";

describe("Database Unit Tests", () => {
  //Test 1: 
    it("should be able to connect to the database", () => {
    expect(typeof connectionGenerator === typeof Database).toBe(true);
  });
});
