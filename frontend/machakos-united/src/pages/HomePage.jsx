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

            <section className="bg-green-700 py-20 px-4 text-white">
              <div className="mx-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    Latest Result
                </h2>
                <p className="text-green-100 text-lg mb-8">
                    KPL - Matchday 12 - Nyayo Stadium
                </p>

                <div className="flex justify-center items-center gap-8 text-5xl font-black">
                 <span>Machakos United</span>
                 <span className="text-6xl">3 - 1</span>
                 <span>Gor Mahia</span>
                </div>

                <p>Goals: Ochieng' (12', 58), Mwangi(90+3')</p>

              </div>

            </section>

            <section className="py-20 px-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden md:flex ">
                    {/*Colored left panel */}
                    <div className="md:w-1/3 bg-green-600 text-white flex flex-col justify-center items-center">
                        <p className="text-sm uppercase tracking-wide">Next Match</p>
                        <p className="text-2xl font-bold">Sat, 28 May</p>
                        <p className="text-lg">4:00 pm EAT</p>
                    </div>
                    {/*Right Panel*/}
                    <div className="md:w-2/3 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center">
                            <p className="font-semibold text-gray-800">Machakos United</p>
                            <p className="text-gray-500 text-sm">Home</p>
                        </div>
                        <div className="text-2xl font-bold text-gray-400">
                            VS
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-800">AFC Leopards</p>
                            <p className="text-gray-500 text-sm">Away</p>
                        </div>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition">
                            GET Tickets
                        </button>
                    </div>
                </div>
            </section>
          

        </div>
    );

};

export default HomePage;