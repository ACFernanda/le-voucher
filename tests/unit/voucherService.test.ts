import { jest } from "@jest/globals";

import voucherService from "../../src/services/voucherService.js";
import voucherRepository from "../../src/repositories/voucherRepository.js";
import { conflictError } from "../../src/utils/errorUtils.js";

describe("voucherService test suite", () => {
  it("should be always very positive", () => {
    expect("didi").toBe("didi");
  });
});

describe("create voucher", () => {
  it("should create voucher", async () => {
    const voucher = { id: 1, code: "VCHR123456", discount: 10, used: false };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);
    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockResolvedValueOnce(voucher);

    await voucherService.createVoucher(voucher.code, voucher.discount);
    expect(voucherRepository.createVoucher).toBeCalledTimes(1);
  });

  it("should fail create voucher - conflict voucher", async () => {
    const voucher = { id: 1, code: "VCHR123456", discount: 10, used: false };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);

    expect(
      voucherService.createVoucher(voucher.code, voucher.discount)
    ).rejects.toEqual(conflictError("Voucher already exist."));
  });
});

describe("apply voucher", () => {
  it("apply voucher", async () => {
    const voucher = { id: 1, code: "VCHR123456", discount: 10, used: false };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockResolvedValueOnce({ ...voucher, used: true });

    const result = await voucherService.applyVoucher(voucher.code, 100);
    expect(result.amount).toEqual(100);
    expect(result.discount).toEqual(voucher.discount);
    expect(result.finalAmount).toEqual(90);
    expect(result.applied).toBe(true);
  });

  it("fail apply voucher - minimum amount not reached", async () => {
    const voucher = { id: 1, code: "VCHR123456", discount: 10, used: false };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(voucher);
    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockResolvedValueOnce({ ...voucher, used: true });

    const result = await voucherService.applyVoucher(voucher.code, 10);
    expect(result.amount).toEqual(10);
    expect(result.discount).toEqual(voucher.discount);
    expect(result.finalAmount).toEqual(10);
    expect(result.applied).toBe(false);
  });

  it("fail apply voucher - conflict", async () => {
    const voucher = { id: 1, code: "VCHR123456", discount: 10, used: false };
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(null);

    expect(voucherService.applyVoucher(voucher.code, 100)).rejects.toEqual(
      conflictError("Voucher does not exist.")
    );
  });
});
