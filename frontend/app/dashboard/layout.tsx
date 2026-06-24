import React from "react"; 

export default function DashboardPage( {
    children, }:{
        children: React.ReactNode;  
    }) {
        return (
            //--navigasi di kiri
            <div className= "flex min-h-screen bg-white">
                <aside className= "w-69 bg-gray-10 p-4 ">
                    <h2 className="text-lg font-bold text-blue-500">SIPANDU Portal</h2><hr />
                    <br />
                    <nav className="space-y-4 text-sm font-medium text-gray-600">
                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Dashboard</p>
                        </div>

                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Pasien</p>
                        </div>

                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Pemeriksaan</p>
                        </div>

                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Laporan</p>
                        </div>

                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Jadwal</p>
                        </div>

                        <div className="h-5 cursor-pointer hover:bg-blue-100 hover:border-l-4 hover:border-blue-500 pl-2">
                            <p>Pengaturan</p>
                        </div>
                    </nav>
                </aside>

                //--isi content di kanan
                <main className="flex-1 p-8">
                    <div className="bg-white-100 p-4">
                        {children}
                    </div>
                </main>
            </div>
    )}
