"use client";
import { Card, CardBody, CircularProgress, user } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { DocumentReference, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { ArcElement, Chart as ChartJS, PieController } from "chart.js/auto";
import { Doughnut } from "react-chartjs-2";

type Data = {
  votes: { votes: string[]; question: string }[];
  title: string;
  user: DocumentReference;
};

ChartJS.register(PieController, ArcElement);

// post-submit has to be configured

export default function SurveyResults({
  params,
}: {
  params: { documentId: string };
}) {
  const [quizData, setQuizData] = useState<Data>();
  const [mapQuizData, setMapQuizData] = useState<
    {
      question: string[];
      votes: number[];
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVotes, setHasVotes] = useState(false);
  const docId = params.documentId;
  const [userRef, setUserRef] = useState<DocumentReference>();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserRef(doc(db, "users", user.uid));
        getData().then(() => {
          setIsLoading(false);
        });
      } else {
        window.location.href = "/";
      }
    });
  });

  const getData = async () => {
    const docRef = doc(db, "surveys", docId);
    const docSnap = await getDoc(docRef);
    setMapQuizData([]);
    if (docSnap.exists()) {
      const fetchedData = {
        votes: docSnap.data().votes,
        title: docSnap.data().title,
        user: docSnap.data().user,
      };
      setQuizData(fetchedData);
      fetchedData.votes.map((question: { question: any; votes: any }) => {
        setMapQuizData((prev) => [
          ...prev,
          {
            question: Array.from(countVotes(question.votes)?.keys() ?? []),
            votes: Array.from(countVotes(question.votes)?.values() ?? []),
          },
        ]);
      });
      fetchedData.votes.map((question: { question: any; votes: any }) => {
        if (question.votes) {
          setHasVotes(true);
        }
      });
    } else {
      // docSnap.data() will be undefined in this case
      alert("No such document!");
    }
  };

  const countVotes = (votes: string[] | undefined) => {
    const votesMap: Map<string, number> = new Map();
    if (!votes) {
      return;
    }
    votes.forEach((vote) => {
      votesMap.set(vote, (votesMap.get(vote) || 0) + 1);
    });
    return votesMap;
  };

  return (
    <>
      <CardBody>
        <div className="w-full max-w-5xl items-center justify-between font-mono">
          {quizData &&
            quizData.title &&
            userRef?.path === quizData.user.path && (
              <h1 className="text-4xl">{quizData.title}</h1>
            )}
          {isLoading ? (
            <CircularProgress label="Loading..." />
          ) : (
            hasVotes &&
            quizData?.user.path === userRef?.path &&
            (quizData?.votes ?? []).map((question, index) => (
              <div key={index}>
                <Doughnut
                  data={{
                    labels: mapQuizData[index].question,
                    datasets: [
                      {
                        label: question.question,
                        data: mapQuizData[index].votes,
                        backgroundColor: [
                          "rgb(255, 127, 0)",
                          "rgb(148, 0, 211)",
                          "rgb(255, 0 , 0)",
                          "rgb(75, 0, 130)",
                          "rgb(0, 255, 0)",
                          "rgb(0, 0, 255)",
                          "rgb(255, 255, 0)",
                        ],
                        borderColor: [
                          "rgb(255, 127, 0)",
                          "rgb(148, 0, 211)",
                          "rgb(255, 0 , 0)",
                          "rgb(75, 0, 130)",
                          "rgb(0, 255, 0)",
                          "rgb(0, 0, 255)",
                          "rgb(255, 255, 0)",
                        ],
                        hoverOffset: 10,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "right",
                      },
                      title: {
                        display: true,
                        text: question.question,
                        color: "white",
                        align: "start",
                        font: {
                          size: 26,
                          weight: "bold",
                          family: "courier",
                        },
                      },
                    },
                    layout: {
                      padding: 50,
                    },
                  }}
                />
              </div>
            ))
          )}
          {!hasVotes && !isLoading && userRef?.path === quizData?.user.path && (
            <Card className="m-4">
              <CardBody>
                <p>
                  No votes have been submitted yet. Please wait for the results!
                </p>
              </CardBody>
            </Card>
          )}
          {!isLoading && userRef?.path !== quizData?.user.path && (
            <Card className="m-4">
              <CardBody>
                <p>This is not your survey. Please login to your account!</p>
              </CardBody>
            </Card>
          )}
        </div>
      </CardBody>
    </>
  );
}
