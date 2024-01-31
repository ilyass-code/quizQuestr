"use client";
import {
  CardBody,
  CircularProgress,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type Data = {
  title: string;
  questions: { answers: string[]; question: string }[];
  votes: { question: string; votes: string[] }[];
};

// post-submit has to be configured

export default function Survey({ params }: { params: { documentId: string } }) {
  const [quizData, setQuizData] = useState<Data>();
  const [isLoading, setIsLoading] = useState(true);
  let votes = [""];
  const docId = params.documentId;

  useEffect(() => {
    const docRef = doc(db, "surveys", docId);
    const getData = async () => {
      const doc = await getDoc(docRef);
      if (doc.exists()) {
        const fetchedData = {
          title: doc.data().title,
          questions: doc.data().questions,
          votes: doc.data().votes,
        };
        setQuizData(fetchedData);
      } else {
        // docSnap.data() will be undefined in this case
        alert("No such quiz exists!");
      }
    };
    getData().finally(() => {
      setIsLoading(false);
    });
  });

  async function submitQuiz(): Promise<void> {
    const ref = doc(db, "surveys", docId);
    const tempVotes = votes.filter((vote) => vote);
    if (quizData?.questions.length == tempVotes.length) {
      votes.map((value, index) => {
        if (quizData?.votes[index].votes && quizData != undefined) {
          quizData.votes[index].votes.push(value);
        } else if (quizData != undefined) {
          quizData.votes[index].votes = [value];
        }
      });
      await updateDoc(ref, {
        votes: quizData.votes,
      }).finally(() => {
        toast.success("Quiz submitted!");
        window.location.href = "/";
      });
    } else {
      toast("select all!");
    }
  }

  const onChangeValue = (value: string, index: number) => {
    votes[index] = value;
  };

  return (
    <>
      <CardBody>
        <div className="w-full max-w-5xl items-center justify-between font-mono">
          {quizData && (
            <h1 className="text-3xl font-bold mb-2">{quizData.title}</h1>
          )}
          <form className="grid items-center text-black">
            {isLoading ? (
              <CircularProgress label="Loading..." />
            ) : (
              quizData &&
              quizData?.questions.map((question, index) => {
                return (
                  <>
                    <RadioGroup
                      label={question.question}
                      className="mx-2 mb-4 mt-1"
                      key={index}
                      onChange={(e) => onChangeValue(e.target.value, index)}
                    >
                      {question.answers.map((answer, index) => {
                        return (
                          <Radio className="mx-2" value={answer} key={index}>
                            {answer}
                          </Radio>
                        );
                      })}
                    </RadioGroup>
                  </>
                );
              })
            )}
          </form>
          {!isLoading && (
            <button
              className="bg-indigo-800 hover:bg-indigo-950 text-white rounded-2xl m-2 p-3 px-5"
              onClick={submitQuiz}
            >
              Submit
            </button>
          )}
        </div>
      </CardBody>
    </>
  );
}
