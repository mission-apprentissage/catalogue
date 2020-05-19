import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Form, FormGroup, Label, Input, Collapse, CardBody, Card, CardHeader } from "reactstrap";
import { API } from "aws-amplify";
import { useFormik } from "formik";
import { v4 as uuidv4 } from "uuid";

import "./users.css";

const UserLine = ({ user }) => {
  const { user: currentUser } = useSelector(state => state.user);
  const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
    initialValues: {
      apiKey: user ? user.Attributes["custom:apiKey"] : "",
      accessAllCheckbox: user ? (user.Attributes["custom:access_all"] === "true" ? ["on"] : []) : [],
      accessAcademieList: user ? user.Attributes["custom:access_academie"].split(",") : "",
      newUsername: "",
      newEmail: "",
      newTmpPassword: "1MotDePassTemporaire!",
    },
    onSubmit: (
      { apiKey, accessAllCheckbox, accessAcademieList, newUsername, newEmail, newTmpPassword },
      { setSubmitting }
    ) => {
      return new Promise(async (resolve, reject) => {
        const accessAcademie = accessAcademieList.join(",");
        const accessAll = accessAllCheckbox.includes("on");

        try {
          if (currentUser.attributes["custom:access_all"]) {
            const refreshToken = currentUser
              .getSignInUserSession()
              .getAccessToken()
              .getJwtToken();
            if (user) {
              const body = {
                refreshToken,
                apiKey,
                accessAll,
                accessAcademie,
              };
              await API.put("api", `/admin/user/${user.Username}`, { body });
              document.location.reload(true);
            } else {
              const body = {
                refreshToken,
                apiKey,
                accessAll,
                accessAcademie,
                newUsername,
                newEmail,
                newTmpPassword,
              };
              await API.post("api", `/admin/user`, { body });
              document.location.reload(true);
            }
          }
        } catch (e) {
          console.log(e);
        }

        setSubmitting(false);
        resolve("onSubmitHandler complete");
      });
    },
  });

  const onGenerateClicked = () => {
    const key = uuidv4().replace(/-/gi, "");
    setFieldValue("apiKey", key);
  };

  const onDeleteClicked = async () => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm("Delete user !?") && currentUser.attributes["custom:access_all"]) {
      const refreshToken = currentUser
        .getSignInUserSession()
        .getAccessToken()
        .getJwtToken();
      await API.del("api", `/admin/user/${user.Username}`, { body: { refreshToken } });
      document.location.reload(true);
    }
  };

  return (
    <Form className="userLine" onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Username:</Label>{" "}
        {user ? (
          user.Username
        ) : (
          <Input type="text" name="newUsername" id="newUsername" onChange={handleChange} value={values.newUsername} />
        )}
      </FormGroup>
      <FormGroup>
        <Label>Email:</Label>{" "}
        {user ? (
          user.Attributes.email
        ) : (
          <Input type="email" name="newEmail" id="newEmail" onChange={handleChange} value={values.newEmail} />
        )}
      </FormGroup>
      {user && (
        <FormGroup>
          <Label>Email verified:</Label> {user.Attributes.email_verified}
        </FormGroup>
      )}
      {!user && (
        <FormGroup>
          <Label>Temporary password:</Label>{" "}
          <Input
            type="text"
            name="newTmpPassword"
            id="newTmpPassword"
            onChange={handleChange}
            value={values.newTmpPassword}
          />
        </FormGroup>
      )}
      <FormGroup className="field">
        <Label for="apiKey">Api key</Label>
        <Input type="text" name="apiKey" id="apiKey" onChange={handleChange} value={values.apiKey} />
        <Button color="success" size="sm" onClick={onGenerateClicked}>
          Generate
        </Button>
      </FormGroup>
      <FormGroup className="field">
        <Label for="accessAllCheckbox">Full access</Label>
        <FormGroup check>
          <Input
            type="checkbox"
            name="accessAllCheckbox"
            id="accessAllCheckbox"
            onChange={handleChange}
            checked={values.accessAllCheckbox.length > 0}
          />
        </FormGroup>
      </FormGroup>
      <FormGroup className="field">
        <Label for="accessAcademie">Académies</Label>
        <FormGroup check className="ml-2">
          <Label check>
            <Input
              type="checkbox"
              name="accessAcademieList"
              id="accessAcademieList"
              value={"-1"}
              onChange={handleChange}
              checked={values.accessAcademieList.includes("-1")}
            />{" "}
            Toutes
          </Label>
          {[
            "00",
            "01",
            "02",
            "03",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
          ].map((num, i) => {
            return (
              <Label check key={i} className="label-academie">
                <Input
                  type="checkbox"
                  name="accessAcademieList"
                  id="accessAcademieList"
                  value={num}
                  onChange={handleChange}
                  checked={values.accessAcademieList.includes(num)}
                />{" "}
                {num}
              </Label>
            );
          })}
        </FormGroup>
      </FormGroup>
      {user && (
        <>
          <Button type="submit" color="primary" className="mr-5">
            Save
          </Button>
          <Button color="danger" onClick={onDeleteClicked}>
            Delete user
          </Button>
        </>
      )}
      {!user && (
        <Button type="submit" color="primary" className="mt-3">
          Create user
        </Button>
      )}
    </Form>
  );
};

const Users = () => {
  const { user } = useSelector(state => state.user);
  const [users, setusers] = useState([]);

  const [isOpen, setIsOpen] = useState([false, false]);

  const toggle = part => {
    isOpen[part] = !isOpen[part];
    setIsOpen([...isOpen]);
  };

  useEffect(() => {
    async function run() {
      try {
        if (user.attributes["custom:access_all"]) {
          const refreshToken = user
            .getSignInUserSession()
            .getAccessToken()
            .getJwtToken();
          const { users: response_users } = await API.get("api", `/admin/users`, {
            queryStringParameters: {
              refreshToken,
            },
          });
          setusers(response_users);
        }
      } catch (e) {
        console.log(e);
      }
    }
    run();
  }, [user]);

  return (
    <div className="page users">
      <h2 className="mt-3 mb-3">Liste des utilisateurs</h2>

      <div className="accordion">
        {users.map((userAttr, i) => {
          return (
            <Card key={i}>
              <CardHeader>
                <h5 className="mb-0">
                  <Button color="link" onClick={() => toggle(i)}>
                    {userAttr.Username}
                  </Button>
                </h5>
              </CardHeader>
              <Collapse isOpen={isOpen[i]}>
                <CardBody>
                  <UserLine user={userAttr} />
                </CardBody>
              </Collapse>
            </Card>
          );
        })}
        <Card>
          <CardHeader>
            <h5 className="mb-0">
              <Button color="link" onClick={() => toggle(users.length)}>
                CREER UN UTILISATEUR
              </Button>
            </h5>
          </CardHeader>
          <Collapse isOpen={isOpen[users.length]}>
            <CardBody>
              <UserLine user={null} />
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

export default Users;
