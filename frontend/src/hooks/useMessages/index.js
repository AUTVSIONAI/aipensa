import { useState, useEffect } from "react";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const useMessages = ({ fromMe, dateStart, dateEnd }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchMessages = async () => {
                try {
                    const { data } = await api.get("/messages-allMe", {
                        params: {
                            fromMe,
                            dateStart,
                            dateEnd,
                        },
                    });
                    setCount(data.count[0].count);
                } catch (err) {
                    toastError(err);
                }
            };

            fetchMessages();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fromMe, dateStart, dateEnd]);

    return { count };
};

export default useMessages;
