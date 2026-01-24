const OnlyForSuperUser = ({ user, yes, no }) =>
  (user?.super === true || (user?.profile && String(user.profile).toUpperCase() === "ADMIN"))
    ? yes()
    : no();

OnlyForSuperUser.defaultProps = {
    user: {},
	yes: () => null,
	no: () => null,
};

export default OnlyForSuperUser;
