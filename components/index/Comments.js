import CardHeader from "@material-ui/core/CardHeader";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import Delete from "@material-ui/icons/Delete";
import withStyles from "@material-ui/core/styles/withStyles";
import Link from "next/link";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";

class Comments extends React.Component {
  state = {
    text: ""
  };

  handleChange = event => {
    this.setState({ text: event.target.value });
  }

  handleSubmit = e => {
    const { text } = this.state;
    const { postId, handleAddComment } = this.props;

    e.preventDefault();
    handleAddComment(postId, text)
    this.setState({ text: "" });

  }

  showComment = comment => {
    const { postId, auth, classes, handleDeleteComment } = this.props;
    const isCommentCreator = comment.postedBy._id === auth.user._id;
    
    return (
      <div>
        <Link href={`/profile/${comment.postedBy._id}`} >
          <a style={{ textDecoration: 'none', color: 'black' }}>{comment.postedBy.name}</a>
        </Link>
        <br />
        {comment.text}
        <span className={classes.commentDate}>
          {this.formatTimeCreated(comment.createdAt)}
          {isCommentCreator && (
            <Delete color="secondary" className={classes.commentDelete} 
              onClick={() => handleDeleteComment(postId, comment)}
            />
          )}
        </span>
      </div>
    );
  };

  formatTimeCreated = time => distanceInWordsToNow(time, {
    includeSeconds: true,
    addSuffix: true
  });

  render() {
    const { auth, comments, classes } = this.props;
    const { text } = this.state;


    return (
      <div className={classes.comments}>
        {/* comment input */}
        <CardHeader 
          avatar={<Avatar className={classes.smallAvatar}
          src={auth.user.avatar} />}
          title={
            <form onSubmit={this.handleSubmit}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="add-comment">Add Comment</InputLabel>
                <Input
                  id="add-comment"
                  name="text"
                  placeholder="Reply to this post"
                  value={text}
                  onChange={this.handleChange}
                />
              </FormControl>
            </form>
          }
          className={classes.cardHeader}
        />

        {/* Commments */}
        {comments.map(comment => (
          <CardHeader avatar={<Avatar className={classes.smallAvatar} 
            src={comment.postedBy.avatar} />}
            title={this.showComment(comment)}
            className={classes.cardHeader}
          />
        ))}
      </div>  
    )
  }
}

const styles = theme => ({
  comments: {
    backgroundColor: "rgba(11, 61, 130, 0.06)"
  },
  cardHeader: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  smallAvatar: {
    margin: 10
  },
  commentDate: {
    display: "block",
    color: "gray",
    fontSize: "0.8em"
  },
  commentDelete: {
    fontSize: "1.6em",
    verticalAlign: "middle",
    cursor: "pointer"
  }
});

export default withStyles(styles)(Comments);