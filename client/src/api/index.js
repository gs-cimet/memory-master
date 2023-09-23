import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
console.log('api', apiBaseUrl)
const url = `${apiBaseUrl}/posts`;

export const fetchPosts = () => axios.get(url);
export const createPost = (newPost) => axios.post(url, newPost);
export const likePost = (id) => axios.patch(`${url}/${id}/likePost`);
export const updatePost = (id, updatedPost) => axios.patch(`${url}/${id}`, updatedPost);
export const deletePost = (id) => axios.delete(`${url}/${id}`);
