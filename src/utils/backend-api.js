import axios from "axios";
import axiosRetry from "axios-retry";
import { dayjs } from "@/utils/time";
import querystring from "querystring";

axios.defaults.withCredentials = true;

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "https://holodex.net/api/v2/" : "/api/v2",
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === "ECONNABORTED",
    shouldResetTimeout: true,
    withCredentials: true,
});

export default {
    channels(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/channels?${q}`);
    },
    videos(query) {
        const q = querystring.stringify(query);
        // console.log(`/videos?${q}`);
        return axiosInstance.get(`/videos?${q}`);
    },
    live(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/live?${q}`).then((res) =>
            res.data
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.start_actual && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h")))),
        );
    },
    channel(id) {
        return axiosInstance.get(`/channels/${id}`);
    },
    video(id) {
        return axiosInstance.get(`/videos/${id}`);
    },
    comments(videoId) {
        return axiosInstance.get(`/videos/${videoId}/comments`);
    },
    // eslint-disable-next-line camelcase
    videoLiveChat(id, type, time_start) {
        const q = querystring.stringify({ type, time_start });
        return axiosInstance.get(`/videos/${id}/live_chat?${q}`);
    },
    videoLiveChatSummary(id) {
        return axiosInstance.get(`/videos/${id}/live_chat/summary`);
    },
    clips(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/clips?${q}`);
    },
    searchAutocomplete(query) {
        return axiosInstance.get(`/search/autocomplete?q=${query}`);
    },
    searchVideo(queryObject) {
        return axiosInstance.post("/search/videoSearch", queryObject);
    },
    searchComments(queryObject) {
        return axiosInstance.post("/search/commentSearch", queryObject);
    },

    channelVideos(channelId, { type = "videos", query }) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/channels/${channelId}/${type}?${q}`);
    },
    login(jwt, authToken, service) {
        return axiosInstance.post(
            "/user/login",
            { token: authToken, service },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    favorites(jwt) {
        return axiosInstance.get("/users/favorites", {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    favoritesVideos(jwt, query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/users/videos?${q}`, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    favoritesLive(query) {
        const q = querystring.stringify(query);
        return axiosInstance.get(`/users/live?${q}`).then((res) =>
            res.data
                // .concat(res.data.upcoming)
                // filter out streams that was goes unlisted if stream hasn't gone live 2 hours after scheduled
                .filter((live) => !(!live.start_actual && dayjs().isAfter(dayjs(live.start_scheduled).add(2, "h"))))
                // get currently live and upcoming lives within the next 3 weeks
                .filter((live) => dayjs(live.start_scheduled).isBefore(dayjs().add(3, "w"))),
        );
    },
    patchFavorites(jwt, operations) {
        return axiosInstance.patch("/users/favorites", operations, {
            headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
        });
    },
    topics() {
        // gets topics from backend
        return axiosInstance.get("/topics");
    },
    topicSet(topicId, videoId, jwt) {
        return axiosInstance.post(
            "/topics/video",
            { videoId, topicId },
            {
                headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
            },
        );
    },
    rotation() {
        return axiosInstance.get("/rotation");
    },
};
