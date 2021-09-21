import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Divider from "@material-ui/core/Divider";
import Edit from "@material-ui/icons/Edit";
import withStyles from "@material-ui/core/styles/withStyles";
import { authInitialProps } from "../lib/auth";
import { getUser, getPostsByUser, deletePost, likePost, unlikePost, addComment, deleteComment } from "../lib/api";
import Link from "next/link";
import FollowUser from "../components/profile/FollowUser";
import DeleteUser from "../components/profile/DeleteUser";
import ProfileTabs from "../components/profile/ProfileTabs";
import format from "date-fns/format";

class Profile extends React.Component {
  state = {
    user: null,
    posts: [],
    isAuth: false,
    isFollowing: false,
    isLoading: true,
    isDeletingPost: false
  };

  componentDidMount() { // destructure userId from authIntialProps and pass to getUser
    const { userId, auth } = this.props;

    getUser(userId).then(async user => {
       // can use isAuth to determine what gets put on the page, if looking at your profile or others
      const isAuth = auth.user._id === userId; // if userId from route is equal to auth
      const isFollowing = this.checkFollow(auth, user);
      const posts = await getPostsByUser(userId);

      this.setState({ // receive user returned and put it in state
        user,
        posts,
        isAuth,
        isFollowing,
        isLoading: false
      });
    });
  };

  checkFollow = (auth, user) => {

    // go through curent users followers and check for follower id
    // if the current user is following this user it will return -1 otherwise return the index
    return user.followers.findIndex(follower => follower._id === auth.user._id) > -1;
  }

  toggleFollow = sendRequest => {
    const { userId } = this.props;
    const { isFollowing } = this.state;

      sendRequest(userId).then(() => {
        this.setState({ isFollowing: !isFollowing });
      })
  };

  handleDeletePost = deletedPost => {
    this.setState({ isDeletingPost: true })

    // get returned post and match for post id in current posts array
    deletePost(deletedPost._id).then(postData => {
     const postIndex = this.state.posts.findIndex(post => post._id === postData._id);
      const updatedPosts = [ 
        ...this.state.posts.slice(0, postIndex),
        ...this.state.posts.slice(postIndex + 1)]
      this.setState({ posts: updatedPosts, isDeletingPost: false });
    }).catch(err => {
      console.log(err);
      this.setState({ isDeletingPost: false });
    });
  };

  handleToggleLike = post => {
    const { auth } = this.props;

    // check if you already liked post
    // send proper response based off isPostLiked
    const isPostLiked = post.likes.includes(auth.user._id);
    const sendRequest = isPostLiked ? unlikePost : likePost;

    sendRequest(post._id).then(postData => {
      const postIndex = this.state.posts.findIndex(
        post => post._id === postData._id
      );
      const updatedPosts = [
        ...this.state.posts.slice(0, postIndex),
        postData, 
        ...this.state.posts.slice(postIndex + 1)
      ];
      this.setState({ posts: updatedPosts });
    }).catch(err => {
      console.log(err);
    });
  };
  
  handleAddComment = (postId, text) => {
    const comment = { text };
    addComment(postId, comment).then(postData => {
      const postIndex = this.state.posts.findIndex(
        post => post._id === postData._id
      );
      const updatedPosts = [
        ...this.state.posts.slice(0, postIndex),
        postData, 
        ...this.state.posts.slice(postIndex + 1)
      ];
      this.setState({ posts: updatedPosts });
    }).catch(err => console.log(err));
  };

  handleDeleteComment = (postId, comment) => {

    deleteComment(postId, comment).then(postData => {
      const postIndex = this.state.posts.findIndex(
        post => post._id === postData._id
      );
      const updatedPosts = [
        ...this.state.posts.slice(0, postIndex),
        postData, 
        ...this.state.posts.slice(postIndex + 1)
      ];
      this.setState({ posts: updatedPosts });
    }).catch(err => console.log(err));
  };

  formatDate = date => format(date, "dddd, MMMM Do, YYYY")

  render() {
    const { classes, auth } = this.props;
    const { isLoading, posts, user, isAuth, isFollowing, isDeletingPost } = this.state;

    return (
      <Paper className={classes.root} elevation={4}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          className={classes.title}
          gutterBottom
        >
          Profile
        </Typography>
        {isLoading ? (
          <div className={classes.progressContainer}>
            <CircularProgress className={classes.progress}
            size={55}
            thickness={5}
            />
          </div>
        ) : (
          <List dense>
            <ListItem>
              <ListItemAvatar>
                <Avatar src={user.avatar} className={classes.bigAvatar}/>
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.email} />

                {/* Auth- edit buttons unauth = follow buttons*/}
                {isAuth ? (
                  <ListItemSecondaryAction>
                    <Link href="/edit-profile">
                      <a>
                        <IconButton color="primary">
                          <Edit/>
                        </IconButton>
                      </a>
                    </Link>
                    <DeleteUser user={user}/>
                  </ListItemSecondaryAction>
                ) : (
                  <FollowUser
                    isFollowing={isFollowing}
                    toggleFollow={this.toggleFollow}
                  />
                )}
            </ListItem>
            <Divider/>
            <ListItem>
              <ListItemText primary={user.about}
               secondary={`Joined: ${this.formatDate(user.createdAt)}`}
               />
            </ListItem>

            {/* Display user posts, following, and followers tabs */}
            <ProfileTabs
              auth={auth}
              posts={posts}
              user={user}
              isDeletingPost={isDeletingPost}
              handleDeletePost={this.handleDeletePost}
              handleToggleLike={this.handleToggleLike}
              handleAddComment={this.handleAddComment}
              handleDeleteComment={this.handleDeleteComment}
          />
          </List>
        )}
      </Paper>
    )
  }
}

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 5,
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      width: 600
    }
  },
  title: {
    color: theme.palette.primary.main
  },
  progress: {
    margin: theme.spacing.unit * 2
  },
  progressContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  },
  bigAvatar: {
    width: 60,
    height: 60,
    margin: 10
  }
});

Profile.getInitialProps = authInitialProps(true);

export default withStyles(styles)(Profile);
