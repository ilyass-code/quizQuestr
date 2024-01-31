"use client";
import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { CardHeader, Divider, CardBody, Card, Image } from "@nextui-org/react";
import { User, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

interface QuestionData {
  question: string;
  answers: string[];
}

export default function SurveyCreation() {
  const [title, setTitle] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionData, setCurrentQuestionData] = useState<QuestionData>({
    question: "",
    answers: [""],
  });
  const [canSubmit, setCanSubmit] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const baseUrl = "https://quiz-questr.vercel.app/survey/";

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        toast.error("You must be logged in to create a survey!");
        window.location.href = "/";
      }
    });
  }, []);

  useEffect(() => {
    setCanSubmit(
      Boolean(currentQuestionData.question) &&
        currentQuestionData.answers.filter((answer) => answer).length > 1
    );
  }, [currentQuestionData]);

  const addTitle = () => {
    if (tempTitle !== "") {
      setTitle(tempTitle);
    } else {
      toast("Please enter a title!");
    }
  };

  const addAnswer = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (
      currentQuestionData.answers[currentQuestionData.answers.length - 1] !== ""
    ) {
      setCurrentQuestionData({
        ...currentQuestionData,
        answers: [...currentQuestionData.answers, ""],
      });
    } else {
      toast("please enter the answer!");
    }
  };

  const getQuestionData = () => {
    const questionData: QuestionData = {
      ...currentQuestionData,
      answers: currentQuestionData.answers.filter((answer) => answer !== ""),
    };
    if (questionData.question === "" || questionData.answers.length <= 1) {
      return null;
    }
    return questionData;
  };

  const newQuestion = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const questionData = getQuestionData();
    if (questionData) {
      setQuestions([...questions, questionData]);
      setCurrentQuestionData({ question: "", answers: [""] });
    } else {
      toast("insert a question and at least 2 answers!");
    }
  };

  const submitSurvey = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const allQuestions = [...questions];
    const questionData = getQuestionData();
    if (questionData) {
      allQuestions.push(questionData);
    }
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const votes = allQuestions.map((question) => {
        return { question: question.question, votes: null };
      });
      await addDoc(collection(db, "surveys"), {
        title: title,
        questions: allQuestions,
        user: userRef,
        votes: votes,
        status: "in progress",
        createdAt: Timestamp.now(),
      }).then((docRef) => {
        toast.success("Survey created successfully!");
        window.location.href = baseUrl + docRef.id;
      });
    }
  };

  return (
    <>
      <CardHeader className="flex gap-3">
        <div>
          <p className="text font-bold">Creating survey</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        {!title && (
          <>
            <div className="w-full max-w-5xl items-center justify-between font-mono  ">
              <form
                className="grid items-center text-black"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="p-3 border rounded m-1"
                  type="text"
                  placeholder="Enter title"
                />
              </form>
            </div>
            <div>
              <button
                className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
                onClick={addTitle}
              >
                Next
              </button>
            </div>
          </>
        )}
        {title && (
          <>
            <div className="w-full max-w-5xl items-center justify-between font-mono  ">
              <h1>{title}</h1>
              <form className="grid items-center text-black">
                <input
                  value={currentQuestionData.question}
                  onChange={(e) =>
                    setCurrentQuestionData({
                      ...currentQuestionData,
                      question: e.target.value,
                    })
                  }
                  className="p-3 border rounded m-1"
                  type="text"
                  placeholder="Enter question"
                />
                {currentQuestionData.answers.map((answer, index) => {
                  if (currentQuestionData.answers.length == 1) {
                    return (
                      <div key={index}>
                        <input
                          key={index}
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...currentQuestionData.answers];
                            newAnswers[index] = e.target.value;
                            setCurrentQuestionData({
                              ...currentQuestionData,
                              answers: [...newAnswers],
                            });
                          }}
                          className="p-3 border m-1 rounded"
                          type="text"
                          placeholder="Enter answer"
                        />
                      </div>
                    );
                  } else if (
                    answer ||
                    index == currentQuestionData.answers.length - 1
                  ) {
                    return (
                      <div key={index}>
                        <input
                          key={index}
                          value={answer}
                          onChange={(e) => {
                            const newAnswers = [...currentQuestionData.answers];
                            newAnswers[index] = e.target.value;
                            setCurrentQuestionData({
                              ...currentQuestionData,
                              answers: [...newAnswers],
                            });
                          }}
                          className="p-3 border m-1 rounded"
                          type="text"
                          placeholder="Enter answer"
                        />
                      </div>
                    );
                  }
                })}
              </form>
              <Card className="text-center text-xl">
                {questions.map((question, index) => {
                  if (question) {
                    return (
                      <div key={index} className="flex m-4">
                        <p>{question.question}</p>
                        <Image
                          alt="Delete button"
                          height={20}
                          width={20}
                          radius="sm"
                          className="my-1 mx-4"
                          src="/delete.svg"
                          onClick={(e) => {
                            e.preventDefault();
                            const newQuestions = [...questions];
                            newQuestions.splice(index, 1);
                            setQuestions([...newQuestions]);
                          }}
                        />
                      </div>
                    );
                  }
                })}
              </Card>
            </div>
            <div>
              <button
                onClick={addAnswer}
                className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
              >
                Add answer
              </button>
              <button
                className="text-white bg-indigo-800 hover:bg-indigo-950 p-3 text-medium my-2 ml-1 rounded-xl"
                onClick={newQuestion}
              >
                Next question
              </button>
              <button
                className={`${
                  canSubmit
                    ? "bg-indigo-800 hover:bg-indigo-950 text-white "
                    : "bg-gray-100 text-black"
                } p-3 text-medium my-2 ml-1 rounded-xl`}
                type="submit"
                disabled={!canSubmit}
                onClick={submitSurvey}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </CardBody>
    </>
  );
}
