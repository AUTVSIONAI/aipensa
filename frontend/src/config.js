function getConfig(name, defaultValue = null) {
    // If inside a docker container, use window.ENV
    if (window.ENV !== undefined) {
        return window.ENV[name] || defaultValue;
    }

    const buildTimeEnv = {
        REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
        REACT_APP_HOURS_CLOSE_TICKETS_AUTO: process.env.REACT_APP_HOURS_CLOSE_TICKETS_AUTO,
        SERVER_PORT: process.env.SERVER_PORT,
        REACT_APP_PRIMARY_COLOR: process.env.REACT_APP_PRIMARY_COLOR,
        REACT_APP_PRIMARY_DARK: process.env.REACT_APP_PRIMARY_DARK,
        REACT_APP_NUMBER_SUPPORT: process.env.REACT_APP_NUMBER_SUPPORT
    };

    return buildTimeEnv[name] || defaultValue;
}

export function getBackendUrl() {
    return getConfig('REACT_APP_BACKEND_URL');
}

export function getHoursCloseTicketsAuto() {
    return getConfig('REACT_APP_HOURS_CLOSE_TICKETS_AUTO');
}

export function getFrontendPort() {
    return getConfig('SERVER_PORT');
}

export function getPrimaryColor() {
    return getConfig("REACT_APP_PRIMARY_COLOR");
}

export function getPrimaryDark() {
    return getConfig("REACT_APP_PRIMARY_DARK");
}

export function getNumberSupport() {
    return getConfig("REACT_APP_NUMBER_SUPPORT");
}
