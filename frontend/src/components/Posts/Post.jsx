const Post = ({ post }) => {
  return (
    <Box
      key={post.id}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      p={4}
    >
      <Image src={post.image} alt={post.caption} borderRadius="md" />
      <Text mt={2} fontWeight="semibold">
        {post.caption}
      </Text>
      <Flex mt={2} align="center" justify="space-between">
        <Flex align="center">
          <IconButton
            aria-label="Like"
            icon={<FaHeart />}
            size="sm"
            mr={2}
            colorScheme="pink"
            variant="ghost"
          />
          <Text>{post.likes}</Text>
        </Flex>
        <IconButton
          aria-label="Share"
          icon={<FaShare />}
          size="sm"
          colorScheme="blue"
          variant="ghost"
        />
      </Flex>
    </Box>
  );
};

export default Post;
