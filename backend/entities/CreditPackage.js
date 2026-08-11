const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CreditPackage',
  tableName: 'credit_packages',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true
    },
    price: {
      type: 'int',
      nullable: false
    },
    credit_amount: {
      type: 'int',
      nullable: false
    },
    created_at: {
      type: 'timestamp',
      createDate: true
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true
    }
  }
});
