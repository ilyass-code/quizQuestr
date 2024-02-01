"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { CardHeader, Divider, CardBody, Image, Card } from "@nextui-org/react";
import { User, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

export default function FriendsQuizCreation() {
  const [title, setTitle] = useState("");
  const [answers, setAnswers] = useState<
    { friend: string; voted: boolean | null }[]
  >([]);
  const [questions, setQuestions] = useState<
    { question: string; votes: any[] | null }[]
  >([]);
  const [isAnswer, setAnswerState] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const baseUrl = "https://quizquestr.vercel.app/friendsQuiz/";

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        toast.error("You must be logged in to create a friends quiz!");
        window.location.href = "/";
      }
    });
  }, []);

  useEffect(() => {
    setCanSubmit(
      Boolean(questions.length) && answers.filter((answer) => answer).length > 2
    );
  }, [questions, answers]);

  const changeOption = () => {
    setAnswerState(!isAnswer);
    setCurrentValue("");
  };

  const addValue = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (currentValue !== "") {
      if (title === "") {
        setTitle(currentValue);
      } else if (isAnswer) {
        setAnswers((prevAnswer) => [
          ...prevAnswer,
          { friend: currentValue, voted: false },
        ]);
      } else {
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          { question: currentValue, votes: null },
        ]);
      }
    } else {
      toast.error("fill the blank!");
    }
    setCurrentValue("");
  };

  const submitQuiz = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (questions && answers.length > 2) {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await addDoc(collection(db, "friendshipQuiz"), {
          title: title,
          questions: questions,
          answers: answers,
          status: "in progress",
          user: userRef,
          createdAt: Timestamp.now(),
        }).then((docRef) => {
          toast.success("Quiz created successfully!");
          window.location.href = baseUrl + docRef.id;
        });
      }
    }
  };

  return (
    <>
      <CardHeader className="flex gap-3">
        <div>
          <p className="text font-bold">Creating Friendship Quiz</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="w-full max-w-5xl items-center justify-between font-mono">
          {title && <h1>{title}</h1>}
          <form
            className="grid items-center text-black"
            onSubmit={(e) => e.preventDefault()}
          >
            {title === "" ? (
              <input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="p-3 border rounded text-white m-1"
                type="text"
                placeholder="Enter title"
              />
            ) : (
              <input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="p-3 border text-white rounded m-1"
                type="text"
                placeholder={
                  !isAnswer ? "Enter a question" : "Enter friend's name"
                }
              />
            )}
          </form>
          <button
            onClick={addValue}
            disabled={title != ""}
            hidden={title != ""}
            className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
          >
            Next
          </button>
          {!isAnswer && title
            ? questions.map((question, index) => {
                return (
                  <Card className="text-center text-xl" key={index}>
                    <div className="flex">
                      <p key={index} className="m-4">
                        {question.question}
                      </p>
                      <Image
                        alt="Delete button"
                        height={20}
                        width={20}
                        radius="sm"
                        className="my-5 mx-2"
                        src="/delete.svg"
                        onClick={() => {
                          setQuestions(
                            questions.filter(
                              (q) => q.question !== question.question
                            )
                          );
                        }}
                      />
                    </div>
                  </Card>
                );
              })
            : answers.map((answer, index) => {
                return (
                  <div className="flex m-2" key={index}>
                    <p key={index}>{answer.friend}</p>
                    <Image
                      alt="Delete button"
                      height={20}
                      width={20}
                      radius="sm"
                      src="/delete.svg"
                      onClick={() => {
                        setAnswers(
                          answers.filter((a) => a.friend !== answer.friend)
                        );
                      }}
                    />
                  </div>
                );
              })}
          <button
            onClick={addValue}
            disabled={title === ""}
            hidden={title === ""}
            className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
          >
            {!isAnswer ? "Add question" : "Add friend"}
          </button>
        </div>
        <div>
          <button
            className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
            disabled={title === ""}
            hidden={title === ""}
            onClick={changeOption}
          >
            {isAnswer ? "Add questions" : "Add friends"}
          </button>
          <button
            className={`${
              canSubmit
                ? "bg-indigo-800 hover:bg-indigo-950 text-white "
                : "bg-gray-100 text-black"
            } p-3 text-medium my-2 ml-1 rounded-xl`}
            disabled={!canSubmit}
            hidden={!canSubmit}
            onClick={submitQuiz}
          >
            Submit
          </button>
        </div>
      </CardBody>
    </>
  );
}
