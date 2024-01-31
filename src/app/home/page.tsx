"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { User, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { CardHeader, Divider, CardBody } from "@nextui-org/react";
import toast from "react-hot-toast";

export default function Home() {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        window.location.href = "/";
      }
    });
  }, []);

  return (
    <>
      <CardHeader className="flex gap-3">
        <p className="text font-extrabold">
          {user && `Welcome ${user.displayName}`}
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="flex-col justify-center">
        <div className="flex justify-evenly ">
          <button
            className="bg-indigo-800 hover:bg-indigo-950 text-white rounded-2xl m-2 p-3 px-5"
            onClick={() => (window.location.href = "/friendsQuiz")}
          >
            Create a friends quiz
          </button>
          <button
            className="bg-indigo-800 hover:bg-indigo-950 text-white rounded-2xl m-2 p-3 px-5"
            onClick={() => (window.location.href = "/survey")}
          >
            Create a survey
          </button>
          <button
            className="bg-indigo-800 hover:bg-indigo-950 text-white rounded-2xl m-2 p-3 px-5"
            onClick={() => (window.location.href = "/results")}
          >
            View results
          </button>
        </div>
        <button
          className="bg-indigo-800 hover:bg-indigo-950 text-white rounded-2xl m-2 p-3 px-5"
          onClick={() => {
            signOut(getAuth())
              .then(() => {
                window.location.href = "/";
              })
              .finally(() => {
                setUser(undefined);
                toast("You have been logged out");
              });
          }}
        >
          Logout
        </button>
      </CardBody>
    </>
  );
}
