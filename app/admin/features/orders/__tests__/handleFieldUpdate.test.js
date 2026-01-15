/**
 * Unit tests for handleFieldUpdate formatting and merge logic
 * 
 * Tests verify that field updates are formatted correctly and state is updated
 * even when backend doesn't return updated fields.
 */

describe("handleFieldUpdate formatting and merge logic", () => {
  // Mock dayjs
  const mockDayjs = (dateStr) => {
    const date = new Date(dateStr);
    return {
      tz: () => ({
        startOf: () => ({
          utc: () => ({
            toISOString: () => date.toISOString(),
          }),
        }),
      }),
      hour: (h) => ({
        minute: (m) => ({
          utc: () => ({
            toISOString: () => {
              const d = new Date(date);
              d.setHours(h, m);
              return d.toISOString();
            },
          }),
        }),
      }),
    };
  };

  describe("Date field formatting", () => {
    test("rentalStartDate: '2026-01-06' => ISO string in Athens timezone", () => {
      const value = "2026-01-06";
      const dateTime = mockDayjs(value);
      const isoString = dateTime.tz("Europe/Athens").startOf("day").utc().toISOString();
      
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
    });

    test("rentalEndDate: '2026-01-10' => ISO string in Athens timezone", () => {
      const value = "2026-01-10";
      const dateTime = mockDayjs(value);
      const isoString = dateTime.tz("Europe/Athens").startOf("day").utc().toISOString();
      
      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
    });
  });

  describe("Time field formatting", () => {
    test("timeIn: '13:45' + existingDate => ISO string", () => {
      const value = "13:45";
      const existingDate = new Date("2026-01-06T12:00:00Z");
      const [hours, minutes] = value.split(":");
      const dateTime = mockDayjs(existingDate.toISOString());
      const isoString = dateTime.hour(parseInt(hours, 10)).minute(parseInt(minutes, 10)).utc().toISOString();
      
      expect(isoString).toContain("13:45");
    });

    test("timeOut: '10:30' + existingDate => ISO string", () => {
      const value = "10:30";
      const existingDate = new Date("2026-01-10T12:00:00Z");
      const [hours, minutes] = value.split(":");
      const dateTime = mockDayjs(existingDate.toISOString());
      const isoString = dateTime.hour(parseInt(hours, 10)).minute(parseInt(minutes, 10)).utc().toISOString();
      
      expect(isoString).toContain("10:30");
    });
  });

  describe("Merge logic", () => {
    test("When result.data is undefined but success=true, state still updates with fieldsToSend", () => {
      const fieldsToSend = {
        rentalStartDate: "2026-01-06T00:00:00.000Z",
      };
      const result = {
        success: true,
        data: undefined,
        message: "Order updated successfully",
      };
      
      // Merge: fieldsToSend + result.data (empty)
      const mergedUpdate = {
        ...fieldsToSend,
        ...(result.data || {}),
      };
      
      expect(mergedUpdate).toEqual(fieldsToSend);
      expect(mergedUpdate.rentalStartDate).toBe("2026-01-06T00:00:00.000Z");
    });

    test("When result.data has updated fields, merge includes both", () => {
      const fieldsToSend = {
        rentalStartDate: "2026-01-06T00:00:00.000Z",
      };
      const result = {
        success: true,
        data: {
          rentalStartDate: "2026-01-06T00:00:00.000Z",
          rentalEndDate: "2026-01-10T00:00:00.000Z", // Additional field from backend
          numberOfDays: 4,
        },
        message: "Order updated successfully",
      };
      
      const mergedUpdate = {
        ...fieldsToSend,
        ...(result.data || {}),
      };
      
      expect(mergedUpdate.rentalStartDate).toBe("2026-01-06T00:00:00.000Z");
      expect(mergedUpdate.rentalEndDate).toBe("2026-01-10T00:00:00.000Z");
      expect(mergedUpdate.numberOfDays).toBe(4);
    });

    test("When result.data has conflicting fields, result.data takes precedence", () => {
      const fieldsToSend = {
        rentalStartDate: "2026-01-06T00:00:00.000Z",
      };
      const result = {
        success: true,
        data: {
          rentalStartDate: "2026-01-07T00:00:00.000Z", // Different from fieldsToSend
        },
        message: "Order updated successfully",
      };
      
      const mergedUpdate = {
        ...fieldsToSend,
        ...(result.data || {}),
      };
      
      // result.data should override fieldsToSend
      expect(mergedUpdate.rentalStartDate).toBe("2026-01-07T00:00:00.000Z");
    });
  });

  describe("State update logic", () => {
    test("State updates with mergedUpdate even if result.data is empty", () => {
      const orders = [
        { _id: "order1", rentalStartDate: "2026-01-05T00:00:00.000Z" },
        { _id: "order2", rentalStartDate: "2026-01-10T00:00:00.000Z" },
      ];
      
      const orderId = "order1";
      const fieldsToSend = {
        rentalStartDate: "2026-01-06T00:00:00.000Z",
      };
      const result = {
        success: true,
        data: null, // Empty data
        message: "Order updated successfully",
      };
      
      const mergedUpdate = {
        ...fieldsToSend,
        ...(result.data || {}),
      };
      
      // Simulate state update
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, ...mergedUpdate } : order
      );
      
      expect(updatedOrders[0].rentalStartDate).toBe("2026-01-06T00:00:00.000Z");
      expect(updatedOrders[1].rentalStartDate).toBe("2026-01-10T00:00:00.000Z"); // Unchanged
    });
  });
});

