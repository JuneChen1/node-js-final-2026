const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CourseBooking',
  tableName: 'course_bookings',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    cancelled_at: {
      type: 'timestamp',
      nullable: true
    },
    created_at: {
      type: 'timestamp',
      createDate: true
    }
  },
  relations: {
    course: {
      type: 'many-to-one',
      target: 'Course',
      joinColumn: { name: 'course_id' },
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
