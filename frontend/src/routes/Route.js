import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";

import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, roles, ...rest }) => {
	const { isAuth, loading, user } = useContext(AuthContext);

	if (rest.path === "/") {
		return <RouterRoute {...rest} component={Component} />;
	}

	if (!isAuth && isPrivate) {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
			</>
		);
	}

	if (isAuth && !isPrivate && rest.path !== "/") {
		return (
			<>
				{loading && <BackdropLoading />}
				<Redirect to={{ pathname: "/dashboard", state: { from: rest.location } }} />;
			</>
		);
	}

	if (isAuth && roles && roles.length > 0) {
		if (!user || !roles.includes(user.profile)) {
			// Se o perfil do usuário não estiver na lista de roles permitidas, redireciona
			return <Redirect to="/dashboard" />;
		}
	}

	return (
		<>
			{loading && <BackdropLoading />}
			<RouterRoute {...rest} component={Component} />
		</>
	);
};

export default Route;
