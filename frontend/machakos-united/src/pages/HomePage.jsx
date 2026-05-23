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
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800">Who We Are</h2>
                    <div className="w-24 h-1 bg-green-600 mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2">
                        <p>
                            Founded in "Add exact date", Machakos United FC is more than a club - it's a family.
                            We've nurtured local talent and brought silverware to Machakos County,
                            winning the Kenyan Premier League three times and the domestic cup twice.
                            Our academy is the heartbeat of the team, producing stars who represent 
                            Kenya on the international stage.
                        </p>

                        <button className="mt-6 text-green-600 font-semibold border-b-2 border-green-600 hover:text-green-700">
                            Learn more →
                        </button>
                    </div>

                    <div>
                        <img src="/images/team-photo.jpg" alt="Machakos United squad"
                             className="rounded-2xl shadow-xl w-full object-cover"/>
                    </div>
                </div>

            </section>
          

        </div>
    );

};

export default HomePage;