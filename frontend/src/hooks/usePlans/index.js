import { useState, useEffect, useCallback } from "react";
import api, { openApi } from "../../services/api";

const usePlans = () => {

    const getPlanList = useCallback(async (params) => {
        try {
            // Try with axios first
            console.log("Fetching plans via openApi...");
            const { data } = await openApi.request({
                url: '/plans/list',
                method: 'GET',
                params: {
                    listPublic: 'true',
                    ...params
                },
                timeout: 10000 // 10s timeout
            });
            console.log("Plans fetched via openApi:", data);
            return data;
        } catch (error) {
            console.error("openApi fetch failed, trying fallback fetch...", error);
            // Fallback to native fetch
            try {
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';
                const url = new URL(`${backendUrl}/plans/list`);
                url.searchParams.append('listPublic', 'true');
                if (params) {
                    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
                }
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log("Plans fetched via native fetch:", data);
                return data;
            } catch (fetchError) {
                console.error("All plan fetch methods failed:", fetchError);
                throw fetchError;
            }
        }
    }, []);

    const list = useCallback(async (params) => {
        const { data } = await api.request({
            url: '/plans/all',
            method: 'GET',
            params
        });
        return data;
    }, []);

    const save = useCallback(async (data) => {
        const { data: responseData } = await api.request({
            url: '/plans',
            method: 'POST',
            data
        });
        return responseData;
    }, []);

    const update = useCallback(async (data) => {
        const { data: responseData } = await api.request({
            url: `/plans/${data.id}`,
            method: 'PUT',
            data
        });
        return responseData;
    }, []);

    const remove = useCallback(async (id) => {
        const { data } = await api.request({
            url: `/plans/${id}`,
            method: 'DELETE'
        });
        return data;
    }, []);

    const getPlanCompany = useCallback(async (params, id) => {
        const { data } = await api.request({
            url: `/companies/listPlan/${id}`,
            method: 'GET',
            params
        });
        return data;
    }, []);

    return {
        getPlanList,
        list,
        save,
        update,
        remove,
        getPlanCompany
    }
}

export default usePlans;