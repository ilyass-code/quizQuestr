"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  CardHeader,
  Divider,
  CardBody,
  Tabs,
  Tab,
  Card,
  Skeleton,
  CardFooter,
  Link,
  Image,
} from "@nextui-org/react";
import { User, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

type Data = {
  title: string;
  status: string;
  quizLink: string;
  resultLink: string;
  createdAt: Timestamp;
};

export default function Results() {
  const [surveyData, setSurveyData] = useState<{
    quizType: string;
    data: Data[] | undefined;
  }>();
  const [friendsQuizData, setFriendsQuizData] = useState<{
    quizType: string;
    data: Data[] | undefined;
  }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        getData(user, "friendshipQuiz").then(() => {
          setIsLoading(false);
        });
        getData(user, "surveys");
      } else {
        toast.error("You must be logged in to view this page!");
        window.location.href = "/";
      }
    });
  }, []);

  const getData = async (user: User, collectionName: string) => {
    const userRef = doc(db, "users", user.uid);
    const q = query(
      collection(db, collectionName),
      where("user", "==", userRef),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    if (collectionName == "friendshipQuiz") {
      setFriendsQuizData({ quizType: "Friends Quiz", data: [] });
      querySnapshot.forEach((doc) => {
        const fetchedData = {
          title: doc.data().title,
          status: doc.data().status,
          createdAt: doc.data().createdAt,
          quizLink: `https://quizquestr.vercel.app/friendsQuiz/${doc.id}`,
          resultLink: `https://quizquestr.vercel.app/results/friendshipQuiz/${doc.id}`,
        };
        setFriendsQuizData((prev) => ({
          quizType: "Friends Quiz",
          data: [...(prev?.data ?? []), fetchedData],
        }));
      });
    } else if (collectionName == "surveys") {
      setSurveyData({ quizType: "Surveys", data: [] });
      querySnapshot.forEach((doc) => {
        const fetchedData = {
          title: doc.data().title,
          status: doc.data().status,
          createdAt: doc.data().createdAt,
          quizLink: `https://quizquestr.vercel.app/survey/${doc.id}`,
          resultLink: `https://quizquestr.vercel.app/results/survey/${doc.id}`,
        };
        setSurveyData((prev) => ({
          quizType: "Surveys",
          data: [...(prev?.data ?? []), fetchedData],
        }));
      });
    }
  };

  return (
    <>
      <CardHeader className="flex gap-3">
        <div>
          <p className="text font-bold">Surveys</p>
        </div>
      </CardHeader>
      <Divider />
      {isLoading ? (
        <Card className="w-[200px] space-y-5 p-4" radius="lg">
          <Skeleton className="rounded-lg">
            <div className="h-24 rounded-lg bg-default-300"></div>
          </Skeleton>
          <div className="space-y-3">
            <Skeleton className="w-3/5 rounded-lg">
              <div className="h-3 w-3/5 rounded-lg bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-4/5 rounded-lg">
              <div className="h-3 w-4/5 rounded-lg bg-default-200"></div>
            </Skeleton>
            <Skeleton className="w-2/5 rounded-lg">
              <div className="h-3 w-2/5 rounded-lg bg-default-300"></div>
            </Skeleton>
          </div>
        </Card>
      ) : (
        <div className="max-w-5xl font-mono">
          <Tabs
            aria-label="Dynamic tabs"
            className="p-4 flex justify-center"
            items={[friendsQuizData, surveyData]}
          >
            {(item) => (
              <Tab key={item?.quizType} title={item?.quizType}>
                {item?.data && (
                  <div className="grid grid-cols-2 gap-4">
                    {item?.data?.length &&
                      item?.data.map((item) => {
                        return (
                          <Card
                            className="max-w-[400px] flex m-4"
                            key={item.title}
                          >
                            <CardHeader className="p-4">
                              <Link
                                className="text-md text-white bold font-bold"
                                href={item.resultLink}
                              >
                                {item.title}
                              </Link>
                            </CardHeader>
                            <Divider />
                            <CardBody className="p-6">
                              <p>{item.status}</p>
                            </CardBody>
                            <Divider />
                            <CardFooter className="p-4">
                              <Link
                                isExternal
                                showAnchorIcon
                                href={item.quizLink}
                              >
                                Link to the quiz
                              </Link>
                              <button
                                onClick={() =>
                                  navigator.clipboard
                                    .writeText(item.quizLink)
                                    .then(() => {
                                      toast.success("Link copied");
                                    })
                                }
                              >
                                <Image
                                  alt="copy icon"
                                  height={20}
                                  src="/clipboard.svg"
                                  width={20}
                                />
                              </button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                  </div>
                )}
                {!item?.data?.length && (
                  <div className="flex justify-center items-center">
                    <Card className="text-center text-xl py-1 px-2 m-2">
                      No surveys yet!
                    </Card>
                  </div>
                )}
              </Tab>
            )}
          </Tabs>
        </div>
      )}
    </>
  );
}
