const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CreditPurchase',
  tableName: 'credit_purchases',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    purchased_credits: {
      type: 'int',
      nullable: false
    },
    price_paid: {
      type: 'int',
      nullable: false
    },
    created_at: {
      type: 'timestamp',
      createDate: true
    }
  },
  relations: {
    creditPackage: {
      type: 'many-to-one',
      target: 'CreditPackage',
      joinColumn: { name: 'credit_package_id' },
      nullable: false
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      nullable: false
    }
  }
});
