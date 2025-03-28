
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
        <div className="inline-flex rounded-full bg-red-100 p-4 mb-4">
          <Package size={32} className="text-stock-blue-700" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl font-medium text-gray-800 mb-2">Page not found</p>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            variant="outline" 
            className="border-stock-blue-600 text-stock-blue-700"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            className="bg-stock-blue-600 hover:bg-stock-blue-700"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
