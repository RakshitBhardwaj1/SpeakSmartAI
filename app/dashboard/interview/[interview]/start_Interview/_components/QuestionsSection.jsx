import React from "react";
import { Lightbulb, Volume2 } from "lucide-react";
function QuestionsSection({ interviewQuestions, activeQuestionIndex, setActiveQuestionIndex }) {
    const currentQuestion = interviewQuestions?.[activeQuestionIndex];
    const currentQuestionText =
      typeof currentQuestion === "string"
        ? currentQuestion
        : currentQuestion?.question ||
          currentQuestion?.text ||
          currentQuestion?.prompt ||
          currentQuestion?.content ||
          "No question available";

    const textToSpeech = (text) => {
      if (!window.speechSynthesis) {
        alert("Sorry, your browser does not support text-to-speech.");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    };

  return interviewQuestions &&(
    <div className="premium-card p-5">
      <div className='grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-5'>
        {interviewQuestions?.map((question, index) => (
          <h2
            key={index}
            onClick={() => setActiveQuestionIndex(index)}
            className={`cursor-pointer rounded-full p-2 text-center text-xs font-semibold md:text-sm ${activeQuestionIndex==index ? 'bg-gradient-to-r from-teal-600 to-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Question #{index + 1}
          </h2>
        ))}
       
      </div>
       <h2 className='my-5 rounded-xl border border-slate-200 bg-white/80 p-4 text-sm leading-relaxed text-slate-800 md:text-lg'>
         {currentQuestionText}
       </h2>
       <button className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white' onClick={() => textToSpeech(currentQuestionText)}>
        <Volume2 className='h-4 w-4' />
        Read Question
       </button>
       <div className="my-0 mt-4 rounded-xl border border-cyan-200 bg-cyan-50/90 p-5">
        <Lightbulb className='text-cyan-700'/>
         <h2 className="my-2 flex items-center gap-2 text-cyan-700">
         
            <strong className="text-sm leading-relaxed">Note: Click on Record Answer when you want to answer the question. At the end of the interview we will give you the feedback along with correct answer for each question on the basis of your performance and your body language and speech tone</strong> 

         </h2>
       </div>
    </div>
  );
}

export default QuestionsSection;
