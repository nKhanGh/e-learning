const CourseDetailPage = ({ params }: { params: { id: string; locale: string } }) => {
  const { id, locale } = params;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Course Detail - {id}</h1>
      <p className="text-gray-700 dark:text-gray-300">
        This is a placeholder for the course detail page. Course ID: {id}, Locale: {locale}
      </p>
    </div>
  );
};

export default CourseDetailPage;