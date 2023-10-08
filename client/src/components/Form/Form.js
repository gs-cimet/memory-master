import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Paper } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import FileBase from 'react-file-base64';
import { isEmpty } from 'validator'

import useStyles from './styles';
import { createPost, updatePost } from '../../actions/posts';

const rules = [
  { key: "creator", rule: (str) => !isEmpty(str), message: "Creator is required" },
  { key: "message", rule: (str) => !isEmpty(str), message: "Message is required" },
  { key: "title", rule: (str) => !isEmpty(str), message: "Title is required" },
  { key: "selectedFile", rule: (str) => !isEmpty(str), message: "Image is required" },
]


const Form = ({ currentId, setCurrentId }) => {
  const [postData, setPostData] = useState({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
  const post = useSelector((state) => (currentId ? state.posts.find((message) => message._id === currentId) : null));
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch();
  const classes = useStyles();
  const fileRef = useRef(null)

  useEffect(() => {
    if (post) {
      setPostData({ ...post, tags: post.tags.join(',') });
      setErrors({});
    }
  }, [post]);

  const clear = () => {
    setCurrentId(0);
    setPostData({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
    fileRef.current.firstChild.value = ''
    setErrors({})
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationResult = {}
    rules.forEach((rule) => {
      if (!rule.rule(postData[rule.key])) {
        validationResult[rule.key] = { message: rule.message, };
      }
    })

    setErrors(validationResult)
    if (Object.keys(validationResult).length > 1) {
      return;
    }

    const newData = {
      ...postData,
      tags: postData.tags.split(',').filter(Boolean).map((el) => el.trim())
    }

    if (currentId === 0) {
      dispatch(createPost(newData));
    } else {
      dispatch(updatePost(currentId, newData));
    }
    clear();
  };

  const handleChange = (e) => {
    const { name, value } = e.target

    const { [name]: _, ...restErrors } = errors
    if (errors[name]) {
      setErrors({ ...restErrors })
    }

    setPostData({
      ...postData,
      [name]: value,
    })
  }

  const handleFileUpload = ({ base64 }) => {
    setPostData({ ...postData, selectedFile: base64 })
    const { selectedFile: _, ...restErrors } = errors
    if (errors["selectedFile"]) {
      setErrors({ ...restErrors })
    }

  }

  const hasErrors = Object.keys(errors).length > 1

  return (
    <Paper className={classes.paper}>
      <form data-test-id="memory-form" autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6">{currentId ? `Editing "${post.title}"` : 'Creating a Memory'}</Typography>
        <TextField name="creator" variant="outlined" label="Creator" fullWidth value={postData.creator} onChange={handleChange} />
        {errors?.creator ? <p>{errors.creator.message}</p> : null}
        <TextField name="title" variant="outlined" label="Title" fullWidth value={postData.title} onChange={handleChange} />
        {errors?.title ? <p>{errors.title.message}</p> : null}
        <TextField name="message" variant="outlined" label="Message" fullWidth multiline rows={4} value={postData.message} onChange={handleChange} />
        {errors?.message ? <p>{errors.message.message}</p> : null}
        <TextField name="tags" variant="outlined" label="Tags (coma separated)" fullWidth value={postData.tags} onChange={handleChange} />
        <div className={classes.fileInput} ref={fileRef}><FileBase type="file" multiple={false} onDone={handleFileUpload} /></div>
        {errors?.selectedFile ? <p>{errors.selectedFile.message}&nbsp;</p> : null}
        {hasErrors ? <p>Please add required fields</p> : null}
        <Button data-test-id="memory-form-submit" className={classes.buttonSubmit} variant="contained" color="primary" size="large" type="submit" fullWidth>Submit</Button>
        <Button data-test-id="memory-form-clear" variant="contained" color="secondary" size="small" onClick={clear} fullWidth>Clear</Button>
      </form>
    </Paper>
  );
};

export default Form;
