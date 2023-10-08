import { FETCH_ALL, CREATE, UPDATE, DELETE, LIKE } from '../constants/actionTypes';

export default (posts = [], action) => {
  switch (action.type) {
    case FETCH_ALL:
      return action.payload;
    case LIKE:
      return posts.map((post) => (post._id === action.payload._id ? action.payload : post));
    case CREATE:
      return [...posts, action.payload];
    case UPDATE:
      console.log("before update")
      console.log({ payload: action.payload })
      console.log({ up: posts })
      const newPosts = posts.map((post) => (post._id === action.payload._id ? action.payload : post));
      console.log({ newPosts })

      return newPosts
    case DELETE:
      return posts.filter((post) => post._id !== action.payload);
    default:
      return posts;
  }
};

