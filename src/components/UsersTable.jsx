import { useState } from "react";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import CommonModal from "./CommonModal";
import Paper from "@mui/material/Paper";
import { Add, Block, Close, Send, Settings } from "@mui/icons-material";
import { Alert, CircularProgress, Divider, Select, MenuItem, Button, TextField, IconButton, Tooltip } from "@mui/material";
import { useDeleteRole, useAddRole, useAddBalance, useBlockUserMutation, useAllUsers, useCreateNotif, useAllRoles } from "@/queries/users";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import RoleChips from "@/components/user-v2/RoleChips";
import { getAssignableRoles, getRoleMessageId } from "@/features/user-v2/roles.mjs";

export default function UsersTable({ data }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRoles, setEditRoles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserBalance, setCurrentUserBalance] = useState(0);
  const [userBalance, setUserBalance] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const MySwal = withReactContent(Swal);
  const queryClient = useQueryClient();
  const deleteRoleMutation = useDeleteRole();
  const addRoleMutation = useAddRole();
  const addBalanceMutation = useAddBalance();
  const sendNotif = useCreateNotif();
  const intl = useIntl();
  const {
    data: roleCatalog = [],
    isLoading: isRolesLoading,
    isError: isRolesError,
    refetch: refetchRoles,
  } = useAllRoles();

  const { refetch } = useAllUsers(0, 20);

  const getAvailableRoles = () =>
    getAssignableRoles(roleCatalog, editRoles);

  const handleDeleteRole = (roleId) => {
    if (!currentUserId || !roleId) return;

    deleteRoleMutation.mutate(
      { userId: currentUserId, roleIds: roleId },
      {
        onSuccess: (response) => {
          toast.info(response.data.message);
          setEditRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
          refetch();
        },
        onError: (error) => toast.error(error.response?.data?.message || "Error"),
      }
    );
  };

  const handleAddRole = () => {
    if (!currentUserId || !selectedRoleId) return;

    addRoleMutation.mutate(
      { userId: currentUserId, roleIds: selectedRoleId },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          const newRole = roleCatalog.find((role) => String(role.id) === String(selectedRoleId));
          if (newRole) {
            setEditRoles((prevRoles) => [...prevRoles, newRole]);
          }
          refetch();
          setSelectedRoleId("");
        },
        onError: (error) => toast.error(error.response?.data?.message || "Error"),
      }
    );
  };

  const handleSendNotif = () => {
    if (!currentUserId) {
      toast.warning("Please enter a valid message.");
      return;
    }

    sendNotif.mutate(
      { userId: currentUserId, title: notifMessage },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || "Sent!");
          setNotifMessage("");
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to send.");
        },
      }
    );
  };

  const handleAddBalance = () => {
    if (!currentUserId || isNaN(userBalance) || userBalance <= 0) {
      toast.warning("Please enter a valid balance amount.");
      return;
    }

    const balanceToAdd = Number(userBalance);

    addBalanceMutation.mutate(
      { userId: currentUserId, balance: balanceToAdd },
      {
        onSuccess: (response) => {
          toast.success(response.data.message || "Balance updated successfully!");
          setCurrentUserBalance((prev) => prev + balanceToAdd);
          setUserBalance("");
          refetch();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to update balance.");
        },
      }
    );
  };

  const filteredData = data
    ?.filter(
      (row) =>
        row.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id));


  const blockUserMutation = useBlockUserMutation(
    (data, userId) => {
      toast.success(data.message);
    },
    (error) => {
      toast.error(error.response?.data?.message || "Failed to update user status.");
    }
  );

  const handleBlockUser = (userId, isActive) => {
    MySwal.fire({
      title: intl.formatMessage({ id: isActive ? "block_user_title" : "unblock_user_title" }),
      text: intl.formatMessage({ id: isActive ? "block_user_text" : "unblock_user_text" }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: intl.formatMessage({ id: isActive ? "yes_block" : "yes_unblock" }),
    }).then((result) => {
      if (result.isConfirmed) {
        blockUserMutation.mutate(userId);
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <TextField
          label={`${intl.formatMessage({ id: 'search' })}...`}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <div onClick={() => setSortAsc((prev) => !prev)}>
                  <FormattedMessage id="id" /> {sortAsc ? <SouthIcon fontSize="" /> : <NorthIcon fontSize="" />}
                </div>
              </TableCell>
              <TableCell align="left"><FormattedMessage id="name" /></TableCell>
              <TableCell align="center"><FormattedMessage id="email" /></TableCell>
              <TableCell align="center"><FormattedMessage id="userroles" /></TableCell>
              <TableCell align="center"><FormattedMessage id="type" /></TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell align="left">{row.firstname || "N/A"}</TableCell>
                <TableCell align="center">{row.email}</TableCell>
                <TableCell align="center">
                  <RoleChips roles={row.roles || []} />
                </TableCell>
                <TableCell align="right">
                  <div
                    className={`text-center text-white rounded-full 
                      ${row.type === "INDIVIDUAL" && "text-blue-600"}
                      ${row.type === "ORGANIZATION" && "text-yellow-600"}
                    `}
                  >
                    {row.type === "INDIVIDUAL" ? intl.formatMessage({ id: 'inn' }) : intl.formatMessage({ id: 'org' })}
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Settings">
                    <IconButton
                      onClick={() => {
                        setModalOpen(true);
                        setEditRoles(row.roles || []);
                        setCurrentUserId(row.id);
                        setCurrentUserBalance(row.balance);
                      }}
                    >
                      <Settings />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Block">
                    <IconButton onClick={() => handleBlockUser(row.id, row.isActive)}>
                      <Block color="error" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {modalOpen && (
        <CommonModal title={intl.formatMessage({ id: 'edituser' })} onClose={() => setModalOpen(false)}>
          <div className="mb-4">
            <div className="text-lg"><FormattedMessage id="sendnotif" /></div>
            <div className="flex gap-2">
              <TextField
                type="text"
                value={notifMessage}
                label={intl.formatMessage({ id: 'sendnotiflabel' })}
                onChange={(e) => setNotifMessage(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendNotif}
                disabled={!notifMessage || sendNotif.isPending}
              >
                {sendNotif.isPending ? <CircularProgress size={20} color="inherit" /> : <Send />}
              </Button>
            </div>
          </div>
          <Divider />
          <div className="mb-4">
            <div className="text-lg"><FormattedMessage id="userbalance" /></div>
            <div className="text-md my-4"><FormattedMessage id="currentbalance" />: {currentUserBalance}</div>
            <div className="flex gap-2">
              <TextField
                type="number"
                value={userBalance}
                label="Add Balance"
                onChange={(e) => setUserBalance(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddBalance}
                disabled={!userBalance || isNaN(userBalance) || addBalanceMutation.isPending}
              >
                {addBalanceMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <Add />}
              </Button>
            </div>
          </div>
          <Divider />
          <div className="my-2">
            <div className="mb-2"><FormattedMessage id="userroles" /></div>
            <div className="flex flex-wrap gap-1">
              {editRoles.length > 0 ? editRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-[#1c2536] rounded-full mx-1 px-2 text-white flex items-center"
                >
                  <div>
                    {intl.formatMessage({
                      id: getRoleMessageId(role.name),
                      defaultMessage: role.name,
                    })}
                  </div>
                  <Close
                    onClick={() => handleDeleteRole(role.id)}
                    className="ml-2"
                    fontSize="12"
                  />
                </div>
              )) : (
                <span className="text-sm text-gray-500"><FormattedMessage id="roles.empty" /></span>
              )}
            </div>
          </div>
          <Divider />
          <div className="my-2">
            <div className="mb-2"><FormattedMessage id="addrole" /></div>
            {isRolesError && (
              <Alert
                severity="error"
                action={<Button color="inherit" size="small" onClick={() => refetchRoles()}><FormattedMessage id="retry" /></Button>}
                className="mb-2"
              >
                <FormattedMessage id="roles.load_error" />
              </Alert>
            )}
            <div className="flex z-[1301]">
              <Select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                displayEmpty
                sx={{ minWidth: 200, marginRight: 2 }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      zIndex: 1301,
                    },
                  },
                  disablePortal: true,
                }}
              >
                <MenuItem value="" disabled>
                  {isRolesLoading ? <CircularProgress size={16} /> : <FormattedMessage id="selectrole" />}
                </MenuItem>
                {getAvailableRoles().map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {intl.formatMessage({
                      id: getRoleMessageId(role.name),
                      defaultMessage: role.name,
                    })}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddRole}
                disabled={!selectedRoleId || isRolesLoading || isRolesError || addRoleMutation.isPending}
              >
                {addRoleMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <FormattedMessage id="addrole" />}
              </Button>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
}
