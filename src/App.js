import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import connection from "./signalrHub";

const App = () => {
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    if (connection.state === "Disconnected") {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR hub");

          connection.on("ReceiveVote", (user, vote) => {
            setVotes((votes) => [...votes, { user, vote }]);
          });
        })
        .catch((error) => console.error("Connection failed: ", error));
    }
  }, []);

  useEffect(() => {
    const svg = d3.select("svg");
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    const groupedVotes = Array.from(
      d3.group(votes, (d) => d.vote),
      ([key, value]) => ({ vote: key, count: value.length })
    );

    x.domain(groupedVotes.map((d) => d.vote));
    y.domain([0, d3.max(groupedVotes, (d) => d.count)]);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count");

    g.selectAll(".bar")
      .data(groupedVotes)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.vote))
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count));
  }, [votes]);

  const sendVote = (user, vote) => {
    if (connection.state === "Connected") {
      connection
        .send("SendVote", user, vote)
        .catch((err) => console.error("Error while sending vote: ", err));
    } else {
      console.log("No connection to server yet.");
    }
  };

  return (
    <div>
      <h1>Real-Time Voting App</h1>
      <button onClick={() => sendVote("User1", "Option1")}>Vote Option1</button>
      <button onClick={() => sendVote("User1", "Option2")}>Vote Option2</button>
      <svg width="600" height="400"></svg>
    </div>
  );
};

export default App;
