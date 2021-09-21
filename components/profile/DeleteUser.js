import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Delete from "@material-ui/icons/Delete";
import { deleteUser } from "../../lib/api";
import { signoutUser } from "../../lib/auth";

class DeleteUser extends React.Component {
  state = {
    open: false,
    isDeleting: false
  };

  handleDeleteUser = () => {
    const { user } = this.props;

    this.setState({ isDeleting: true }); // when deleting dont allow to click button

    // first sign out user then delete and push to signup page
    deleteUser(user._id).then(() => {
      signoutUser();
    }).catch(err => {
      console.log(err)
      this.setState({ isDeleting: false })
    });
  };

  handleOpen = () => this.setState({ open: true });

  handleClose = () => this.setState({ open: false });

  render() {
    const { open, isDeleting } = this.state;


    return (
        <div>
          <IconButton onClick={this.handleOpen} color="default">
            <Delete/>
          </IconButton>

          <Dialog open={open} onClose={this.handleClose}>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Do you wish to delete your account?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleClose} color="primary">Cancel</Button>
                <Button onClick={this.handleDeleteUser} disabled={isDeleting} color="default">
                  {isDeleting ? "Deleting Account..." : "Confirm"}
                </Button>
              </DialogActions>
          </Dialog>
        </div>
    )
  }
}

export default DeleteUser;
