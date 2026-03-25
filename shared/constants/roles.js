// these role values are reused in auth, navigation, and listing logic
export const USER_ROLES = Object.freeze({
  STUDENT: 'Student',
  LANDLORD: 'Landlord',
});

// screens map over this list so we only maintain the role order once
export const USER_ROLE_OPTIONS = Object.freeze([USER_ROLES.STUDENT, USER_ROLES.LANDLORD]);
