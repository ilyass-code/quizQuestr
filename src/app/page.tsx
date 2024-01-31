"use client";
import React, { useEffect } from "react";
import { auth, db, provider } from "./firebase";
import { CardBody, CardHeader, Divider } from "@nextui-org/react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { setDoc, doc, Timestamp } from "firebase/firestore";

export default function LoginPage() {
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        window.location.href = "/home";
      }
    });
  }, []);

  const popUpLogin = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          createdAt: Timestamp.now(),
        });
      })
      .then(() => (window.location.href = "/home"));
  };

  return (
    <>
      <CardHeader className="flex gap-3">
        <div>
          <h1 className="text-3xl font-bold m-2 font-mono">Login page</h1>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <button
          className="bg-indigo-800 hover:bg-indigo-950 text-white font-semibold rounded-2xl m-2 p-3 px-5"
          onClick={popUpLogin}
        >
          Login
        </button>
      </CardBody>
    </>
  );
}
