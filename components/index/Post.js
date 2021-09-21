import Badge from "@material-ui/core/Badge";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Comment from "@material-ui/icons/Comment";
import DeleteTwoTone from "@material-ui/icons/DeleteTwoTone";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import withStyles from "@material-ui/core/styles/withStyles";
import Link from "next/link";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";

import Comments from "./Comments";


// pure component only calls render method when it detects changes in state or props
// shallow comparison, helps with load

class Post extends React.PureComponent {
  state = {
    isLiked: false,
    numLikes: 0,
    comments: []
  };

  
  componentDidMount() {
    this.setState({
      isLiked: this.checkLiked(this.props.post.likes),
      numLikes: this.props.post.likes.length, // check num of likes
      comments: this.props.post.comments
    });
  };

  componentDidUpdate(prevProps) {
    // if likes array has changed for given post between previous value and now
    if(prevProps.post.likes.length !== this.props.post.likes.length) {
      this.setState({
        isLiked: this.checkLiked(this.props.post.likes),
        numLikes: this.props.post.likes.length // check num of likes
      });
    }

    if(prevProps.post.comments.length !== this.props.post.comments.length) {
      this.setState({
        comments: this.props.post.comments
      })
    }
  }

  // check if user liked by searching for id in likes array
  checkLiked = likes => likes.includes(this.props.auth.user._id); 

  formatTimeCreated = time => distanceInWordsToNow(time, {
    includeSeconds: true,
    addSuffix: true
  });

  render() {
    const { classes, post, auth, isDeletingPost, handleDeletePost, 
       handleToggleLike, handleAddComment, handleDeleteComment } = this.props;
    const { isLiked, numLikes, comments } = this.state;
    const isPostCreator = post.postedBy._id === auth.user._id;

    return (
        <Card className={classes.card}>
          <CardHeader
            avatar={<Avatar src={post.postedBy.avatar} />}
            action={
              isPostCreator && (
                <IconButton
                  disabled={isDeletingPost}
                  onClick={() => handleDeletePost(post)}
                >
                  <DeleteTwoTone color="secondary" />
                </IconButton>
              )
            }
            title={<Link href={`/profile/${post.postedBy._id}`}>
              <a style={{ textDecoration: 'none', color: 'black' }}
              >{post.postedBy.name}</a>
            </Link>}
            subheader={this.formatTimeCreated(post.createdAt)}
            className={classes.cardHeader}
          />
          {/* Post Body with text */}
          <CardContent className={classes.cardContent}>
            <Typography variant="body1" className={classes.text}>
              {post.text}
            </Typography>
            {/* Post image if there is one */}
            {post.image && (
              <div className={classes.imageContainer}>
                <img className={classes.image} src={post.image} />
              </div>
            )}
          </CardContent>
          {/* Post actions(Like and Comment) */}
          <CardActions>
            <IconButton onClick={() => handleToggleLike(post)} className={classes.button}>
              <Badge badgeContent={numLikes} color="secondary">
                {isLiked ? (
                  <Favorite className={classes.favoriteIcon} />
                ) : (
                  <FavoriteBorder className={classes.favoriteIcon} />
                )}
              </Badge>
            </IconButton>
            <IconButton className={classes.button}>
              <Badge badgeContent={comments.length} color="secondary" >
                <Comment className={classes.commentIcon} />
              </Badge>
            </IconButton>
          </CardActions>
          <Divider />

          {/* Commments Section */}
          <Comments
            auth={auth}
            postId={post._id}
            comments={comments}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
          />
        </Card>
      )
  }
}

const styles = theme => ({
  card: {
    marginBottom: theme.spacing.unit * 3
  },
  cardContent: {
    backgroundColor: "white"
  },
  cardHeader: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    backgroundColor: "rgba(11, 61, 130, 0.06)"
  },
  imageContainer: {
    textAlign: "center",
    padding: theme.spacing.unit
  },
  image: {
    height: 200
  },
  favoriteIcon: {
    color: theme.palette.favoriteIcon
  },
  commentIcon: {
    color: theme.palette.commentIcon
  }
});

export default withStyles(styles)(Post);
