import React from "React";

const HomePage = () => {
    return (
        <div className="bg-gray-50 font-sans">
          <header className="relative h-screen bg-cover bg-center bg-no-repeat"
                  style={{backgroundImage: "url('/images/hero-stadium.jpg)"}}>
                <div className="absolute inset-0 bg-black/50">
                    <div className="relaive z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
                        <h1 className="text-5xl md:text-7xl font-bold mb-4">
                            Machakos United FC
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-2xl">
                            Pride of Machakos 
                        </p>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg">
                            Buy Tickets
                        </button>
                    </div>
                </div>

          </header>
           
        <section className="py-20 px-4 max-w-6xl mx-auto">

        </section>
          

        </div>
    );

};

export default HomePage;