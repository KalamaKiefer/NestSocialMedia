import CircularProgress from "@material-ui/core/CircularProgress";
import Drawer from "@material-ui/core/Drawer";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import withStyles from "@material-ui/core/styles/withStyles";
import { authInitialProps } from "../lib/auth";
import  Router from "next/router";
import PostFeed from "../components/index/PostFeed";
import UserFeed from "../components/index/UserFeed";


const Index = ({ classes, auth }) => (
  <main className={classes.root}>
    {auth.user && auth.user._id ? (

      <Grid container>
        <Grid item xs={12} sm={12} md={7}>
            <PostFeed auth={auth}/>
        </Grid>
        <Grid item className={classes.drawerContainer}>
          <Drawer
            className={classes.drawer}
            variant="permanent"
            anchor="right"
            classes={{
              paper: classes.drawerPaper
            }}
          >
            <UserFeed auth={auth} />
          </Drawer>
        </Grid>
      </Grid>

    ): (
      // splash page
      <Grid
        justify="center"
        alignItems="center"
        direction="row"
        container
        className={classes.heroContent}
      >
      <Typography component="h1" variant="h2" align="center"
        color="primary" gutterBottom>
          Nest: A Better Social Network
      </Typography>
      <Typography variant="h6" align="center" color="secondary" component="p">
        Come hang out at the nest! Connect with friends and family and share experiences through this new social network!
      </Typography>
        <Button className={classes.fabButton} variant="extendedFab" color="primary" 
         onClick={() => Router.push("/signup")}>Get Connected!</Button>
      </Grid>
    )}
  </main>
)

const styles = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 10,
    paddingLeft: theme.spacing.unit * 5,
    [theme.breakpoints.down("sm")]: {
      paddingRight: theme.spacing.unit * 5
    }
  },
  progressContainer: {
    height: "80vh"
  },
  progress: {
    margin: theme.spacing.unit * 2,
    color: theme.palette.secondary.light
  },
  drawerContainer: {
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  },
  drawer: {
    width: 350
  },
  drawerPaper: {
    marginTop: 70,
    width: 350
  },
  fabButton: {
    margin: theme.spacing.unit * 3
  },
  heroContent: {
    maxWidth: 600,
    paddingTop: theme.spacing.unit * 8,
    paddingBottom: theme.spacing.unit * 6,
    margin: "0 auto"
  }
});

Index.getInitialProps = authInitialProps();

export default withStyles(styles)(Index);
