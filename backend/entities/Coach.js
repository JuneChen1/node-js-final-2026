const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'Coach',
  tableName: 'coaches',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    experience_years: {
      type: 'integer',
      nullable: false,
      default: 0
    },
    description: {
      type: 'text',
      nullable: true
    },
    profile_image_url: {
      type: 'varchar',
      length: 2048,
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      createDate: true
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true
    }
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      nullable: false
    }
  }
});
