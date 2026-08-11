const { EntitySchema } = require('typeorm');
module.exports = new EntitySchema({
  name: 'CoachLinkSkill',
  tableName: 'coach_link_skill',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    }
  },
  relations: {
    coach: {
      type: 'many-to-one',
      target: 'Coach',
      joinColumn: { name: 'coach_id' },
      nullable: false
    },
    skill: {
      type: 'many-to-one',
      target: 'Skill',
      joinColumn: { name: 'skill_id' },
      nullable: false
    }
  }
});
