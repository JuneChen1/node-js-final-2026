const { dataSource } = require('../db/data-source');
const appError = require('../utils/appError');
const {
  isValidString,
  isPositiveInteger,
  isValidUUID
} = require('../utils/validUtils');

const creditPackageController = {
  async getCreditPackages(req, res, next) {
    try {
      const creditPackageRepo = dataSource.getRepository('CreditPackage');
      const data = await creditPackageRepo.find({
        select: { id: true, name: true, credit_amount: true, price: true }
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  async postCreditPackage(req, res, next) {
    const { name, credit_amount, price } = req.body;
    if (
      !isValidString(name) ||
      !isPositiveInteger(credit_amount) ||
      !isPositiveInteger(price)
    ) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }
    try {
      const creditPackageRepo = dataSource.getRepository('CreditPackage');
      const existing = await creditPackageRepo.findOneBy({ name: name.trim() });
      if (existing) {
        next(appError(409, '資料重複'));
        return;
      }

      const data = await creditPackageRepo.save({
        name: name.trim(),
        credit_amount,
        price
      });
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  },
  async deleteCreditPackage(req, res, next) {
    const { creditPackageId } = req.params;
    if (!isValidUUID(creditPackageId)) {
      next(appError(400, 'ID錯誤'));
      return;
    }
    try {
      const creditPackageRepo = dataSource.getRepository('CreditPackage');
      const result = await creditPackageRepo.delete(creditPackageId);
      if (result.affected === 0) {
        next(appError(400, 'ID錯誤'));
        return;
      }
      res.status(200).json({
        status: 'success',
        data: {
          raw: result.raw,
          affected: result.affected
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = creditPackageController;
