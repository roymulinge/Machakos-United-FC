import React from "React";

const HomePage = () => {
    return (
        <div className="bg-gray-50 font-sans">
          <header className="relative h-screen bg-cover bg-center bg-no-repeat"
                  style={{backgroundImage: "url('/images/hero-stadium.jpg)"}}>
                <div className="absolute inset-0 bg-black/50">
                    <div className="relaive z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
                        <h1>Machakos United FC</h1>
                        <p>Pride of Machakos </p>
                        <button>Buy Tickets</button>
                    </div>
                </div>

          </header>

        </div>
    );

};

export default HomePage;