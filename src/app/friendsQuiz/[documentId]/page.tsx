"use client";
import {
  Card,
  CardBody,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Skeleton,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { DocumentReference, doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

type Data = {
  answers: { friend: string; voted: boolean }[];
  questions: { votes: string[]; question: string }[];
  status: string;
  user: DocumentReference;
};

// post-submit has to be configured

export default function FriendsQuiz({ params }: { params: { documentId: string } }) {
  const [quizData, setQuizData] = useState<Data>();
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  let votes = [""];
  const docId = params.documentId;

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, "friendshipQuiz", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fetchedData = {
          answers: docSnap.data().answers,
          questions: docSnap.data().questions,
          status: docSnap.data().status,
          user: docSnap.data().user,
        };
        if (fetchedData.status == "Finished") {
          alert("This quiz has already been finished");
          window.location.href = "/";
        }
        setQuizData(fetchedData);
      } else {
        // docSnap.data() will be undefined in this case
        alert("No such quiz exists!");
      }
    };
    getData().then(() => {
      setIsLoading(false);
    });
  });

  useEffect(() => {
    if (isSubmitted) {
      toast.success("Quiz submitted successfully");
      window.location.href = "/";
    }
  }, [isSubmitted]);

  async function submitQuiz(): Promise<void> {
    const ref = doc(db, "friendshipQuiz", docId);
    const tempVotes = votes.filter((vote) => vote);
    if (quizData?.questions.length == tempVotes.length) {
      quizData?.answers.map((friend, index) => {
        if (friend.friend == currentUser) {
          quizData.answers[index].voted = true;
        }
      });
      votes.map((value, index) => {
        if (quizData?.questions[index].votes && quizData != undefined) {
          quizData.questions[index].votes.push(value);
        } else if (quizData != undefined) {
          quizData.questions[index].votes = [value];
        }
      });
      if (quizData.answers.every((friend) => friend.voted)) {
        await updateDoc(ref, {
          answers: quizData?.answers,
          questions: quizData?.questions,
          status: "Finished",
        }).finally(() => {
          setIsSubmitted(true);
        });
      } else {
        await updateDoc(ref, {
          answers: quizData?.answers,
          questions: quizData?.questions,
        }).finally(() => {
          setIsSubmitted(true);
        });
      }
    } else {
      toast.error("Select all!");
    }
  }

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentUser(e.target.value);
  };

  const onChangeValue = (value: string, index: number) => {
    votes[index] = value;
  };

  return (
    <>
      <CardBody>
        <div className="w-full max-w-5xl items-center justify-between font-mono">
          <form className="grid items-center text-black">
            {currentUser &&
              !isLoading &&
              quizData?.questions.map((question, index) => {
                return (
                  <>
                    <RadioGroup
                      label={question.question}
                      key={index}
                      onChange={(e) => onChangeValue(e.target.value, index)}
                    >
                      {quizData.answers
                        .filter((current) => current.friend !== currentUser)
                        .map((answer, index) => {
                          return (
                            <Radio value={answer.friend} key={index}>
                              {answer.friend}
                            </Radio>
                          );
                        })}
                    </RadioGroup>
                  </>
                );
              })}
            {isLoading ? (
              <Card className="w-[300px] h-[100px] p-4" radius="lg">
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>
              </Card>
            ) : (
              !currentUser && (
                <div>
                  <h1 className="text-large text-white font-bold m-2">
                    Who will be taking the quiz?
                  </h1>
                  <Select
                    label="choose a user"
                    selectedKeys={currentUser}
                    className="max-w-xs m-2"
                    onChange={handleSelectionChange}
                  >
                    {(quizData?.answers ?? [])
                      .filter((current) => !current.voted)
                      .map((username) => (
                        <SelectItem
                          key={username.friend}
                          value={username.friend}
                        >
                          {username.friend}
                        </SelectItem>
                      ))}
                  </Select>
                </div>
              )
            )}
          </form>
          {currentUser && !isLoading && (
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
